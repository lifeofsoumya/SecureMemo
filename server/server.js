const express = require('express')
const { encrypt, decrypt } = require('keyhasher');
const fs = require('fs');
require('dotenv').config();
const multer = require('multer');
const upload = multer({
    limits: { fileSize: 1024 }
});

const app = express()

async function encryptMemo(input, key){
    return new Promise((resolve, reject)=>{
        let encrypted = encrypt(input, key);
        fs.writeFile('memo.smon', encrypted, (err) => {
            if (err) {
                reject (err);
            }else{
                // console.log(`File has been created, ${encrypted}`);
                resolve (encrypted);
            }
            
        });
    })
}

async function decryptMemo(key){
    return new Promise((resolve, reject)=>{
        fs.readFile('./memo.smon', (err, encryptedData) => {
            if (err) {
                console.log(err.message)
                reject (err);
            } else {
                let decrypted = decrypt(encryptedData.toString(), key);
                // console.log(decrypted);
                resolve(decrypted);
            }
        });
    })
}

encryptMemo('This is secure memo object notation, aka SMON', 5);
setTimeout(()=>{decryptMemo(5)}, 2000)

app.post('/encrypt', async (req, res) => {
    const input = req.body.input;
    const key = req.body.key || process.env.CRYPT_KEY;
    try {
        const encrypted = await encryptMemo(input, key);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=memo.smon');
        res.send(encrypted);
    } catch (err) {
        console.error('Error encrypting memo:', err);
        res.status(500).send('Error encrypting memo');
    }
});

app.post('/decrypt', async (req, res) => {
    const key = req.body.key || process.env.CRYPT_KEY;
    try {
        const decrypted = await decryptMemo(key);
        res.setHeader('Content-Type', 'text/plain');
        res.send(decrypted);
    } catch (err) {
        console.error('Error decrypting memo:', err);
        res.status(500).send('Error decrypting memo');
    }
});


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    // File size is acceptable, proceed with processing
    // ...
});

app.get('/', (req, res) => {
    res.send('Welcome to Secure Memo Object Notation system')
    }
)

const port = process.env.PORT || 8080
app.listen(port, () => {console.log(`Server listening on port ${port}`)})