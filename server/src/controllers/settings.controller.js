const { query } = require('../config/db');

// Get all store settings
exports.getSettings = async (req, res) => {
  try {
    const result = await query('SELECT setting_key, setting_value, description FROM store_settings');
    const settingsMap = {};
    (result.rows || []).forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    // Provide defaults if empty
    const defaults = {
      instapay_username: 'vortex.store@instapay',
      vodafone_cash_number: '01012345678',
      orange_cash_number: '01212345678',
      etisalat_cash_number: '01112345678',
      whatsapp_number: '+201012345678',
      store_announcement: '🔥 NEW GAMES ARRIVED! Hot Xbox deals starting from 50 EGP! Instant digital delivery to your console.'
    };

    return res.json({ settings: { ...defaults, ...settingsMap } });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.status(500).json({ message: 'Error retrieving store settings' });
  }
};

// Update store settings (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // e.g. { instapay_username: '...', vodafone_cash_number: '...' }

    for (const [key, val] of Object.entries(updates)) {
      if (typeof val === 'string') {
        await query(
          `INSERT INTO store_settings (setting_key, setting_value, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, val]
        );
      }
    }

    return res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ message: 'Error updating store settings' });
  }
};
