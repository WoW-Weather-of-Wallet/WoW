package com.wow.domain.term.service;

import com.wow.domain.term.dto.TermResponse;
import com.wow.domain.term.entity.Term;
import com.wow.domain.term.repository.TermRepository;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InternalServerException;
import com.wow.global.exception.NotFoundException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
@RequiredArgsConstructor
public class TermService {

    private static final Duration PRESIGN_DURATION = Duration.ofHours(1);

    private final TermRepository termRepository;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // [fix] 수정 전: 트랜잭션 안에서 S3 presign 생성 | 이유: DB 커넥션 점유 시간을 줄이기 위해 조회와 외부 호출을 분리
    public List<TermResponse> getTerms() {
        List<Term> terms = getTermEntities();
        return terms.stream()
                .map(term -> TermResponse.from(term, presignUrl(term)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Term> getTermEntities() {
        return termRepository.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Term getCurrentRequiredTerm() {
        return termRepository.findFirstByRequiredTrueAndEffectiveAtLessThanEqualOrderByEffectiveAtDescIdDesc(LocalDate.now())
                .orElseThrow(() -> new NotFoundException("현재 유효한 필수 약관이 존재하지 않습니다."));
    }

    private String presignUrl(Term term) {
        String key = resolveObjectKey(term.getS3Url());
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_DURATION)
                .getObjectRequest(getObjectRequest)
                .build();

        try {
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (S3Exception | SdkClientException e) {
            throw new InternalServerException("약관 파일 URL 생성에 실패했습니다.", e);
        }
    }

    private String resolveObjectKey(String s3Url) {
        if (s3Url == null || s3Url.isBlank()) {
            throw new BadRequestException("S3 URL이 비어있습니다.");
        }

        String trimmed = s3Url.trim();
        if (trimmed.startsWith("s3://")) {
            String withoutScheme = trimmed.substring(5);
            int slash = withoutScheme.indexOf('/');
            if (slash > 0) {
                String bucketName = withoutScheme.substring(0, slash);
                String key = withoutScheme.substring(slash + 1);
                if (!bucketName.equals(bucket)) {
                    throw new BadRequestException("S3 URL의 버킷이 일치하지 않습니다.");
                }
                return key;
            }
            throw new BadRequestException("올바르지 않은 S3 URL 형식입니다.");
        }

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            URI uri = URI.create(trimmed);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                throw new BadRequestException("S3 URL 경로가 비어있습니다.");
            }

            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);
            String normalized = decodedPath.startsWith("/") ? decodedPath.substring(1) : decodedPath;
            String host = uri.getHost() == null ? "" : uri.getHost();

            if (host.startsWith(bucket + ".")) {
                return normalized;
            }

            String bucketPrefix = bucket + "/";
            if (normalized.startsWith(bucketPrefix)) {
                return normalized.substring(bucketPrefix.length());
            }

            if (isS3Host(host)) {
                throw new BadRequestException("S3 URL의 버킷이 일치하지 않습니다.");
            }
            throw new BadRequestException("올바르지 않은 S3 URL 형식입니다.");
        }

        return trimmed;
    }

    private boolean isS3Host(String host) {
        return host.contains("amazonaws.com") || host.contains(".s3.");
    }
}
