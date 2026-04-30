const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:8080/api`
    : window.location.hostname === 'dev.mbgone.site'
        ? 'https://dev.mbgone.site/api'
        : (window.location.hostname === 'mbgone.id' || window.location.hostname === 'www.mbgone.id')
            ? 'https://api.mbgone.id/api'
            : 'https://api.mbgone.site/api';

export const getGoogleDriveSources = (url: string): string[] => {
    if (!url) return [];
    
    // Handle comma-separated lists if they exist in a single field
    const targetUrl = url.includes(',') ? url.split(',')[0].trim() : url;
    let id = '';
    
    if (targetUrl.includes('lh3.googleusercontent.com/d/')) {
        id = targetUrl.split('/d/')[1].split('?')[0];
    } else if (targetUrl.includes('drive.google.com/open?id=')) {
        id = new URLSearchParams(targetUrl.split('?')[1]).get('id') || '';
    } else if (targetUrl.includes('drive.google.com/file/d/')) {
        id = targetUrl.split('/file/d/')[1].split('/')[0].split('?')[0];
    } else if (targetUrl.includes('drive.google.com/viewer/main?id=')) {
        id = new URLSearchParams(targetUrl.split('?')[1]).get('id') || '';
    } else if (targetUrl.includes('drive.google.com/thumbnail?id=')) {
        id = new URLSearchParams(targetUrl.split('?')[1]).get('id') || '';
    } else if (targetUrl.includes('drive.google.com/uc?id=')) {
        id = new URLSearchParams(targetUrl.split('?')[1]).get('id') || '';
    }

    if (id) {
        return [
            `https://drive.google.com/thumbnail?id=${id}&sz=w600`,
            `https://lh3.googleusercontent.com/d/${id}`, 
            `https://drive.google.com/uc?id=${id}`
        ];
    }

    return [url];
};

export const resolveGoogleDriveUrl = (url: string) => {
    const sources = getGoogleDriveSources(url);
    return sources.length > 0 ? sources[0] : url;
};

export const formatDateID = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch (e) {
        return dateStr;
    }
};

export const getImageUrl = (url: string) => {
    if (!url) return '';
    
    // Handle comma-separated lists
    const targetUrl = url.includes(',') ? url.split(',')[0].trim() : url;
    
    // Resolve Google Drive URLs first
    const resolvedUrl = resolveGoogleDriveUrl(targetUrl);
    if (resolvedUrl.startsWith('http')) return resolvedUrl;
    
    if (url.startsWith('http')) return url;
    
    // If it's a relative path like /uploads/..., prefix with backend base URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    const profileStr = localStorage.getItem('mbg_profile');
    if (profileStr) {
        try {
            const profile = JSON.parse(profileStr);
            if (profile.role) headers['X-User-Role'] = profile.role;
            if (profile.kitchen_id) headers['X-Kitchen-ID'] = profile.kitchen_id.toString();
        } catch (e) {
            console.error('Failed to parse profile for headers', e);
        }
    }
    
    return headers;
};

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('API request failed');
        return response.json();
    },
    post: async (endpoint: string, data: any) => {
        const isFormData = data instanceof FormData;
        const headers = getHeaders();
        if (isFormData) {
            delete headers['Content-Type'];
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'API request failed');
        }
        return response.json();
    },
    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'API request failed');
        }
        return response.json();
    },
    delete: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('API request failed');
        return response.json();
    },

    // Specific Methods
    getKitchenGrowth: (id: number) => api.get(`/kitchens/${id}/growth`),
    getRentalRecords: () => api.get('/rentals'),
    postRentalRecord: (data: any) => api.post('/rentals', data),
    getPayouts: () => api.get('/payouts'),
    calculatePayout: (data: any) => api.post('/payouts/calculate', data),
    postPayout: (data: any) => api.post('/payouts', data),
    updateRemittance: (id: number, data: any) => api.put(`/payouts/details/${id}/remit`, data),
};

export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Finance' | 'HRD' | 'Procurement' | 'Staff' | 'PIC Dapur' | 'Operator Koperasi' | 'Investor';

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
    koperasi_id?: number;
    sppg_id: string; // Hubungan ke data SPPG
    running_date?: string;
    pic_name?: string;
    pic_phone?: string;
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
    kitchen_id?: number;
    position_id: number;
    position: string; // Legacy
    position_detail?: Position;
    department_id: number;
    department: string; // Legacy
    department_detail?: Department;
    kitchen_detail?: Kitchen;
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
    kitchen_id?: number;
}

export interface TransactionCategory {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
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

export interface Koperasi {
    id: number;
    name: string;
    address?: string;
    phone?: string;
}

export interface RentalRecord {
    id: number;
    kitchen_id: number;
    date: string;
    amount: number;
    period: string;
    status: string;
    notes?: string;
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
    recipient_name: string;
    role: string;
    amount: number;
    percentage: number;
    status: string;
    remittance?: any;
}
