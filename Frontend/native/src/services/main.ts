import { nativeApi } from './auth';

interface ApiResponse<T> {
  data: T;
}

export interface SpendingHalfYearlyResponse {
  spendingType: {
    name: string;
    iconCode: string;
    summary: string;
  };
  categoryResults: Array<{
    name: string;
    iconCode: string;
    percentage: number;
  }>;
  description: string;
}

export interface SpendingMonthlyCompareResponse {
  currentMonth: {
    year: number;
    month: number;
    totalAmount: number;
    categories: Array<{
      categoryId: number | null;
      categoryName: string;
      icon: string;
      percentage: number;
    }>;
  };
  lastMonth: {
    year: number;
    month: number;
    totalAmount: number;
    categories: Array<{
      categoryId: number | null;
      categoryName: string;
      icon: string;
      percentage: number;
    }>;
  };
}

export interface CreateBudgetRequest {
  amount: number;
}

export interface CurrentBudgetResponse {
  goalAmount: number;
  totalSpent: number;
  remainingAmount: number;
  usagePercentage: number;
  remainingDays: number;
  dailyAvailable: number;
  savedAmount: number;
}

export interface CreateBudgetResponse {
  id: number;
  amount: number;
  budgetDate: string;
}

export async function getSpendingHalfYearly() {
  const response = await nativeApi.get<ApiResponse<SpendingHalfYearlyResponse>>(
    '/api/v1/spending/half-yearly',
  );

  return response.data.data;
}

export async function getSpendingMonthlyCompare() {
  const response = await nativeApi.get<ApiResponse<SpendingMonthlyCompareResponse>>(
    '/api/v1/spending/monthly/compare',
  );

  return response.data.data;
}

export async function getCurrentBudget() {
  const response = await nativeApi.get<ApiResponse<CurrentBudgetResponse>>('/api/v1/budget');

  return response.data.data;
}

export async function createBudget(payload: CreateBudgetRequest) {
  const response = await nativeApi.post<ApiResponse<CreateBudgetResponse>>(
    '/api/v1/budget',
    payload,
  );

  return response.data.data;
}
