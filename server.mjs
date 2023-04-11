import express from "express";
import cors from "cors";
import multer from "multer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import path from "path";
import PQueue from "p-queue";

const __dirname = path.resolve(path.dirname(""));

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

const requestQueue = new PQueue({ concurrency: 1 });

async function getFFmpeg() {
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    ffmpegLoadingPromise = undefined;
  }

  return ffmpegInstance;
}

const app = express();
const port = 3004;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  return res.sendFile(__dirname + "/public/client.html");
});

app.post("/thumbnail", upload.single("video"), async (req, res) => {
  let outputData = null;

  try {
    const videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.png`;

    await requestQueue.add(async () => {
      ffmpeg.FS("writeFile", inputFileName, videoData);

      await ffmpeg.run(
        "-ss",
        "00:00:01.000",
        "-i",
        inputFileName,
        "-frames:v",
        "1",
        outputFileName
      );

      outputData = ffmpeg.FS("readFile", outputFileName);
      ffmpeg.FS("unlink", inputFileName);
      ffmpeg.FS("unlink", outputFileName);
    });

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFileName}`,
      "Content-Length": outputData.length,
    });
    res.end(Buffer.from(outputData, "binary"));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/gif", upload.single("video"), async (req, res) => {
  let outputData = null;

  try {
    const videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.png`;

    await requestQueue.add(async () => {
      ffmpeg.FS("writeFile", inputFileName, videoData);

      await ffmpeg.run(
        "-y",
        "-t",
        "3",
        "-i",
        inputFileName,
        "-filter_complex",
        "fps=5,scale=720:-1:flags=lanczos[x];[x]split[x1][x2];[x1]palettegen[p];[x2][p]paletteuse",
        "-f",
        "gif",
        outputFileName
      );

      outputData = ffmpeg.FS("readFile", outputFileName);
      ffmpeg.FS("unlink", inputFileName);
      ffmpeg.FS("unlink", outputFileName);
    });

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFileName}`,
      "Content-Length": outputData.length,
    });
    res.end(Buffer.from(outputData, "binary"));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`[info] ffmpeg-api listening at http://lb-ffmepg-1143567075.us-east-1.elb.amazonaws.com:${port}`);
});
