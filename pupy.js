import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { exit } from "process";
import puppeteer from "puppeteer";

const scrap = async (url, filename) => {
    process.stdout.write("Fetching video url......\n\n");
    try {
        const browser = await puppeteer.launch({
            headless: "new",
        });
        const page = await browser.newPage();

        await page.goto(url);

        await page.waitForTimeout(4000);

        const videoTag = await page.$("video");

        const videoUrl = await videoTag.evaluate((ele) => ele.src);

        await downloadVideo(videoUrl, filename);

        await browser.close();
    } catch (error) {
        process.stdout.write(
            `An error occured while opening puppeteer: ${error}\n`
        );

        exit();
    }
};

const downloadVideo = async (url, filename) => {
    try {
        const res = await axios.get(url, { responseType: "stream" });

        const totalLength = res.headers["content-length"];
        let downloadedLength = 0;

        let counter = 1;
        let downloadLocation = path.join(os.homedir(), "Downloads", filename);

        while (fs.existsSync(downloadLocation)) {
            const fileExtension = path.extname(filename);
            const baseName = path.basename(filename, fileExtension);

            downloadLocation = path.join(
                os.homedir(),
                "Downloads",
                `${baseName}_${counter}${fileExtension}`
            );
            counter++;
        }

        const writer = fs.createWriteStream(downloadLocation);

        res.data.on("data", (chunk) => {
            downloadedLength += chunk.length;
            const percentComplete = (downloadedLength / totalLength) * 100;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Downloading: ${percentComplete.toFixed(2)}%`);
        });

        await res.data.pipe(writer);

        await new Promise((resolve) => {
            writer.on("finish", resolve);
        });
        process.stdout.write("\n########################################\n\n");
        process.stdout.write(
            `Video downloaded and saved to ${downloadLocation}\n`
        );
        process.stdout.write("\n\n########################################\n");
    } catch (error) {
        console.log(error);
    }
};

export default scrap;
