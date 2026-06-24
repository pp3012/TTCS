"use strict";
const bcrypt = require('bcrypt');
async function hashPassword() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    console.log('Hashed password:', hash);
}
hashPassword();
//# sourceMappingURL=test.js.map