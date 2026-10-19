
const { createServerClient } = require('@supabase/ssr');

function createSupabaseSession(req, res) {
    return createServerClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return Object.entries(req.cookies || {}).map(
                        ([name, value]) => ({ name, value })
                    );
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookie(name, value, {
                            ...options,
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/'
                        });
                    });
                }
            }
        }
    );
}

module.exports = createSupabaseSession;
