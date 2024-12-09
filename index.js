const express = require('express');
const nodemailer = require('nodemailer');
const archiver = require('archiver');
const fs = require('fs');
const request = require('request');
const app = express();

app.use(express.json());

app.post('/send-report', async (req, res) => {
    const { files, user } = req.body;

    const zipFilePath = './files.zip';
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', async () => {
        // Setup email transport
        let transporter = nodemailer.createTransport({
            service: 'Outlook365',
            auth: {
                user: process.env.OUTLOOK_EMAIL,
                pass: process.env.OUTLOOK_PASSWORD
            }
        });

        // Send email
        let info = await transporter.sendMail({
            from: '"Team Monitor" <myoariyan2010@outlook.com>',
            to: 'myoariyan2010@outlook.com', // Send to your email
            subject: 'Tab Report',
            text: `Here are the files from Google Drive for ${user.fullName} (${user.email}):`,
            attachments: [{
                filename: 'files.zip',
                path: zipFilePath
            }]
        });

        fs.unlinkSync(zipFilePath); // Remove the temporary zip file
        res.send('Report sent');
    });

    archive.on('error', err => {
        throw err;
    });

    archive.pipe(output);

    files.forEach(file => {
        const fileStream = request({
            url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        archive.append(fileStream, { name: file.name });
    });

    archive.finalize();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
