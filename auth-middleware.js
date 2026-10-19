
const createSupabaseSession = require('./supabase-session');

async function requireAuth(req, res, next) {
    try {
        const supabaseSession = createSupabaseSession(req, res);

        const { data, error } = await supabaseSession.auth.getUser();

        if (error || !data.user) {
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    error: 'Please log in to continue.'
                });
            }

            return res.redirect('/login');
        }

        req.user = data.user;
        req.supabase = supabaseSession;

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error.message);

        return res.status(500).json({
            error: 'Unable to verify your session.'
        });
    }
}

module.exports = requireAuth;

