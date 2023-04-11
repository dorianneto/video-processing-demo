const API_THUMBNAIL_ENDPOINT = "http://lb-ffmepg-1143567075.us-east-1.elb.amazonaws.com/thumbnail";
const API_GIF_ENDPOINT = "http://lb-ffmepg-1143567075.us-east-1.elb.amazonaws.com/gif";

const fileInput = document.querySelector("#file-input");
const createThumbnailButton = document.querySelector("#create-thumbnail");
const createGifButton = document.querySelector("#create-gif");
const thumbnailPreview = document.querySelector("#thumbnail");
const errorDiv = document.querySelector("#error");

function showError(msg) {
  errorDiv.innerText = `ERROR: ${msg}`;
}

async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}

async function createThumbnail(video) {
  const payload = new FormData();
  payload.append("video", video);

  const res = await fetch(API_THUMBNAIL_ENDPOINT, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    throw new Error("Creating thumbnail failed");
  }

  const thumbnailBlob = await res.blob();
  const thumbnail = await blobToDataURL(thumbnailBlob);

  return thumbnail;
}

createThumbnailButton.addEventListener("click", async () => {
  const { files } = fileInput;

  if (files.length > 0) {
    const file = files[0];
    try {
      const thumbnail = await createThumbnail(file);
      thumbnailPreview.src = thumbnail;
    } catch (error) {
      showError(error);
    }
  } else {
    showError("Please select a file");
  }
});

async function createGif(video) {
  const payload = new FormData();
  payload.append("video", video);

  const res = await fetch(API_GIF_ENDPOINT, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    throw new Error("Creating thumbnail failed");
  }

  const thumbnailBlob = await res.blob();
  const thumbnail = await blobToDataURL(thumbnailBlob);

  return thumbnail;
}

createGifButton.addEventListener("click", async () => {
  const { files } = fileInput;

  if (files.length > 0) {
    const file = files[0];
    try {
      const thumbnail = await createGif(file);
      thumbnailPreview.src = thumbnail;
    } catch (error) {
      showError(error);
    }
  } else {
    showError("Please select a file");
  }
});
