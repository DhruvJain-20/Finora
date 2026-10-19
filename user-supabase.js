
const { createClient } = require('@supabase/supabase-js');

function getUserSupabase(req) {
    if (!req.accessToken) {
        throw new Error('Authenticated access token is missing.');
    }

    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${req.accessToken}`
                }
            }
        }
    );
}

module.exports = getUserSupabase;
