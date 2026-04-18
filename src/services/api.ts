const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = {
    get: async (endpoint: string, params?: Record<string, any>) => {
        const savedProfile = localStorage.getItem('mbg_profile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;
        
        let url = `${API_BASE_URL}${endpoint}`;
        if (params) {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) query.append(key, String(value));
            });
            url += `?${query.toString()}`;
        }
        const response = await fetch(url, {
            headers: {
                'X-User-Role': profile?.role || '',
                'X-Kitchen-ID': profile?.kitchen_id ? String(profile.kitchen_id) : ''
            }
        });
        if (!response.ok) throw new Error('API request failed');
        return response.json();
    },
    post: async (endpoint: string, data: any) => {
        const savedProfile = localStorage.getItem('mbg_profile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': profile?.role || '',
                'X-Kitchen-ID': profile?.kitchen_id ? String(profile.kitchen_id) : ''
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'API request failed');
        }
        return response.json();
    },
    put: async (endpoint: string, data: any) => {
        const savedProfile = localStorage.getItem('mbg_profile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': profile?.role || '',
                'X-Kitchen-ID': profile?.kitchen_id ? String(profile.kitchen_id) : ''
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'API request failed');
        }
        return response.json();
    },
    delete: async (endpoint: string) => {
        const savedProfile = localStorage.getItem('mbg_profile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'X-User-Role': profile?.role || '',
                'X-Kitchen-ID': profile?.kitchen_id ? String(profile.kitchen_id) : ''
            }
        });
        if (!response.ok) throw new Error('API request failed');
        return response.json();
    },
    // New Helper Methods
    getRentalRecords: (params?: any) => api.get('/rental-records', params),
    postRentalRecord: (data: any) => api.post('/rental-records', data),
    calculatePayout: (data: any) => api.post('/calculate-payout', data),
    postPayout: (data: any) => api.post('/payouts', data),
    getPayouts: (params?: any) => api.get('/payouts', params),
    updateRemittance: (detailId: number, data: any) => api.put(`/payout-details/${detailId}/remit`, data),
    postFinancialRecord: (data: any) => api.post('/financial-records', data),
    getKitchenGrowth: (id: number) => api.get(`/dapur/${id}/growth`),
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const savedProfile = localStorage.getItem('mbg_profile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'X-User-Role': profile?.role || '',
                'X-Kitchen-ID': profile?.kitchen_id ? String(profile.kitchen_id) : ''
            },
            body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    }
};

export type UserRole = 'Super Admin' | 'Manager' | 'Finance' | 'HRD' | 'Procurement' | 'Staff' | 'PIC Dapur' | 'Operator Koperasi' | 'Investor';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    department: string;
    position: string;
    phone: string;
    avatar_url: string;
    kitchen_id?: number;
    created_at: string;
    updated_at: string;
}

export interface Kitchen {
    id: number;
    name: string;
    type: string;
    address: string;
    lat: number;
    lng: number;
    capacity: number;
    status: string;
    region: string;
    investor_share: number;
    dpp_share: number;
    portion_target: number;
    initial_capital: number;
    accumulated_profit: number;
    bep_status: string;
    sppg_id: string; // Hubungan ke data SPPG
    investors?: InvestorParticipant[];
    routes?: Route[];
    // Relasi tambahan dari ekstensi yang kini di-nest di dalam sppg_detail
    sppg_detail?: Sppg;
}

export interface InvestorParticipant {
    id: number;
    kitchen_id: number;
    kitchen?: Kitchen;
    name: string;
    investment_amount: number;
    share_percentage: number;
    saham_ratio: string;
}

export interface Route {
    id: number;
    kitchen_id: number;
    route_name: string;
    vehicle: string;
    driver: string;
    status: string;
    eta: string;
}

export interface Employee {
    id: number;
    number: string;
    name: string;
    position_id: number;
    position: string; // Legacy
    position_detail?: Position;
    department_id: number;
    department: string; // Legacy
    department_detail?: Department;
    salary: number;
    status: string;
    photo: string;
    hire_date: string;
}

export interface Department {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    name: string;
}

export interface Transaction {
    id: number;
    date: string;
    type: string;
    category: string;
    amount: number;
    status: string;
}

export interface Loan {
    id: number;
    number: string;
    lender: string;
    amount: number;
    margin_rate: number;
    monthly_payment: number;
    remaining_balance: number;
    status: string;
    start_date: string;
    end_date: string;
}

export interface FinancialSummary {
    total_income: number;
    total_expense: number;
    cash_flow: number;
}

export interface Contract {
    id: number;
    number: string;
    project_name: string;
    sppg_id?: string;
    vendor_name: string;
    vendor: string;
    kitchen: string;
    value: number;
    total_value: number;
    progress: number;
    status: string;
    payment_status: string;
    start_date: string;
    end_date: string;
    updates?: ProgressUpdate[];
}

export interface ProgressUpdate {
    id: number;
    contract_id: number;
    task_name: string;
    description: string;
    date: string;
    progress_percentage: number;
    percentage: number;
    notes: string;
    termin: number;
    amount: number;
    payment_status: string;
    photo_url?: string;
}

export interface Equipment {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    supplier: string;
    status: string;
    stock_status: string;
    image: string;
}

export interface PurchaseOrder {
    id: number;
    number: string;
    supplier: string;
    items_count: number;
    total_amount: number;
    status: string;
    date: string;
}

export interface Vacancy {
    id: number;
    title: string;
    department: string;
    category: string;
    type: string;
    description: string;
    status: string;
    posted: string;
    deadline: string;
    applicants_list?: Applicant[];
}

export interface Applicant {
    id: number;
    vacancy_id: number;
    name: string;
    email: string;
    status: string;
    interview_date?: string;
}

export interface Stakeholder {
    id: number;
    name: string;
    phone: string;
    role: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
}

export interface SppgInfrastructure {
    id: number;
    sppg_id: string;
    land_area: number;
    building_area: number;
    building_status: string;
    road_access_size: number;
    allowed_vehicles: string;
    building_condition: string;
}

export interface SppgStakeholder {
    id: number;
    sppg_id: string;
    pj_id: number;
    pj?: Stakeholder;
    landlord_id: number;
    landlord?: Stakeholder;
    annual_rent_cost: number;
}

export interface OperationalFleet {
    id: number;
    sppg_id: string;
    fleet_type: string;
    vehicle_description: string;
    photo_media_id: string;
}

export interface SppgReadiness {
    id: number;
    sppg_id: string;
    has_ipal: boolean;
    has_gas: boolean;
    has_listrik: boolean;
    has_water_filter: boolean;
    has_exhaust: boolean;
    has_halal_cert: boolean;
    is_ready_to_run: boolean;
}

export interface Sppg {
    id: number;
    sppg_id: string;
    name: string;
    location: string;
    progress: string;
    media?: SppgMedia[];
    infrastructure?: SppgInfrastructure;
    stakeholder?: SppgStakeholder;
    readiness?: SppgReadiness;
    fleets?: OperationalFleet[];
    created_at: string;
    updated_at: string;
}

export interface SppgMedia {
    id: number;
    sppg_id: string;
    preview_url: string;
    media_type: string;
}

export interface RentalRecord {
    id?: number;
    kitchen_id: number;
    date: string;
    amount: number;
    period: string;
    status: string;
    notes: string;
}

export interface ProfitDistribution {
    id?: number;
    kitchen_id: number;
    period: string;
    total_pool: number;
    investor_split: number;
    dpp_split: number;
    ywmp_split: number;
    is_post_bep: boolean;
    status: string;
    details?: PayoutDetail[];
    created_at?: string;
}

export interface PayoutDetail {
    id?: number;
    distribution_id: number;
    recipient_name: string;
    role: string;
    amount: number;
    percentage: number;
    status: string;
    remittance_id?: number;
    remittance?: Remittance;
}

export interface Remittance {
    id?: number;
    payout_id: number;
    paid_at: string;
    payment_method: string;
    evidence_url: string;
    notes: string;
    status: string;
}

export interface FinancialRecord {
  id?: number;
  dapur_id: number;
  period?: string;
  total_portions: number;
  rental_income: number;
  selisih_bahan_baku: number;
  status: string;
  evidence_url?: string;
}
