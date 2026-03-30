const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'assets', 'imgs', 'WOW_logo.png');
const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
const adaptivePath = path.join(__dirname, 'src', 'assets', 'adaptive-icon.png');

async function fixIcons() {
  try {
    // 앱 아이콘(iOS/구형 안드로이드): 투명도를 절대 허용하지 않음 (투명하면 회색/검정색으로 렌더링됨)
    // - flatten({ background: '#ffffff' })를 사용하여 원본 이미지의 투명한 부분을 모두 완전한 가장 하얀색으로 덮어버립니다.
    // - 하단 글씨를 완전히 날리기 위해 가로세로 비율 중 아래쪽을 더 날립니다 (높이 260으로 더 타이트하게 컷)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 260 })
      .flatten({ background: '#ffffff' }) // ✨ 필수: 투명 영역을 흰색으로 박제
      .resize({ width: 1024, height: 1024, fit: 'contain', background: '#ffffff' })
      .toFile(iconPath);
      
    // 어댑티브 아이콘(최신 안드로이드): 글씨가 삐져나가지 않도록 Safe Zone(안전 영역) 안으로 로고를 꽉 누릅니다.
    // 배경을 완벽하게 투명/혹은 흰색으로 박아버립니다. 이번엔 어댑티브 아이콘도 흰색으로 덮어버려서 회색을 방지해봅시다.
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: 360, height: 260 })
      .flatten({ background: '#ffffff' })
      .resize({ width: 660, height: 660, fit: 'contain', background: '#ffffff' })
      .extend({
        top: 182, bottom: 182, left: 182, right: 182,
        background: '#ffffff'
      })
      .toFile(adaptivePath);

    console.log('✅ 아이콘 투명도(회색 배경) 제거 및 비율 수정 완료!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixIcons();
