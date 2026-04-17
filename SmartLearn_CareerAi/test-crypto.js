const argon2 = require('argon2');
const crypto = require('node:crypto');

async function test() {
    try {
        console.log("Testing Argon2...");
        const hash = await argon2.hash("test");
        console.log("Hash:", hash);

        console.log("Testing SHA-3...");
        const sha3 = crypto.createHash('sha3-512').update("test").digest('hex');
        console.log("SHA3:", sha3);

        console.log("Test Passed!");
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
