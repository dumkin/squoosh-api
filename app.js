import express from 'express';
import { ImagePool } from '@squoosh/lib';

const port = 1041;

const app = express();

app.use(express.json({ limit: '16mb' }))

// import { cpus } from 'os';
const imagePool = new ImagePool(1); //cpus().length

app.post('/info', async (req, res, next) => {
  try {
    let b = req.body;
    if (b.image == null) {
      res.status(400);
      res.type('application/json');
      return res.end(JSON.stringify({
        "error": "image is null"
      }))
    }

    let imageRequest = Buffer.from(b.image, 'base64');

    const image = imagePool.ingestImage(imageRequest);
    let decoded = await image.decoded;

    return res.send(JSON.stringify({
      width: decoded.bitmap.width,
      height: decoded.bitmap.height
    }));
  } catch (err) {
    res.status(400);
    res.type('application/json');
    return res.end(JSON.stringify({
      "error": err.toString()
    }))
  }
});

app.post('/', async (req, res, next) => {
  try {
    let b = req.body;
    if (b.image == null) {
      res.status(400);
      res.type('application/json');
      return res.end(JSON.stringify({
        "error": "image is null"
      }))
    }

    let imageRequest = Buffer.from(b.image, 'base64');

    const image = imagePool.ingestImage(imageRequest);
    await image.decoded;

    if (b.resize != null) {
      await image.preprocess({
        resize: b.resize
      });
    }

    if (b.mozjpeg == null) {
      res.status(400);
      res.type('application/json');
      return res.end(JSON.stringify({
        "error": "mozjpeg is null"
      }))
    }

    await image.encode({
      mozjpeg: b.mozjpeg
    });

    const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;

    let imageResponseBuffer = Buffer.from(rawEncodedImage);
    let imageResponse = imageResponseBuffer.toString('base64');

    return res.send(imageResponse);
  } catch (err) {
    res.status(400);
    res.type('application/json');
    return res.end(JSON.stringify({
      "error": err.toString()
    }))
  }
});

app.listen(port, () =>
  console.log(`squoosh-api listening on port ${port}!`),
);