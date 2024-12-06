const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pokemonlist = [
    "amonistar.png",
    "carabaffe.png",
    "carapuce.png",
    "dofin.png",
    "flotajou.png",
    "gobou.png",
    "greninja.png",
    "kyogre.png",
    "hypocean.png",
    "leviator.png",
    "lokhlass.png",
    "loupio.png",
    "phione.png",
    "stari.png",
    "volcanion.png",
    "wailmer.png",
];

app.post('/generate-qrcode', (req, res) => {
    const { link, imageName } = req.body;

    if (!link || !imageName) {
        return res.status(400).send('Lien et image sont nécessaires.');
    }

    // Vérifie si l'image sélectionnée fait partie de la liste des Pokémon
    if (!pokemonlist.includes(imageName)) {
        return res.status(400).send('Image sélectionnée invalide.');
    }

    const assetsDirectory = path.join(__dirname, 'assets');
    const selectedImage = path.join(assetsDirectory, imageName);
    const outputImage = `qrcode/qrcode-${link.replace('://', '').replace(/\//g, '')}.png`;

    exec(`python3 generate-qrcode -i ${selectedImage} -l ${link}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur lors de l'exécution du script Python: ${stderr}`);
            return res.status(500).send('Erreur interne du serveur.');
        }

        console.log(stdout);
        res.json({ imagePath: outputImage });
    });
});

app.get('/qrcode', (req, res) => {
    const qrcodeDirectory = path.join(__dirname, './qrcode');

    fs.readdir(qrcodeDirectory, (err, files) => {
        if (err) {
            console.error(`Erreur lors de la lecture du dossier qrcode: ${err}`);
            return res.status(500).send('Erreur interne du serveur.');
        }

        const qrcodeFiles = files.filter(file => /\.png$/i.test(file));

        if (qrcodeFiles.length === 0) {
            return res.status(404).send('Aucun QR code trouvé dans le dossier qrcode.');
        }

        const qrcodesContent = qrcodeFiles.map(file => {
            const filePath = path.join(qrcodeDirectory, file);
            const fileContent = fs.readFileSync(filePath, 'base64');
            return { fileName: file, content: fileContent };
        });

        res.json({ qrcodes: qrcodesContent });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
