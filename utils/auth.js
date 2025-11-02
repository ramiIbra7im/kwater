// utils/auth.js
export const checkTokenValidity = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            // تنظيف البيانات المحلية إذا كان التوكن غير صالح
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token');
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token check error:', error);
        return false;
    }
};