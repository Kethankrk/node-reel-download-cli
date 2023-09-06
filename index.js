#!/usr/bin/env node
import scrap from "./pupy.js";
import inquirer from "inquirer";

try {
    const answer = await inquirer.prompt({
        name: "url",
        type: "input",
        message: "Enter the instagram video url: ",
    });

    const filename = await inquirer.prompt({
        name: "filename",
        type: "input",
        message: "Enter the filename: ",
        default() {
            return "Untitled";
        },
    });

    scrap(answer.url, `${filename.filename}.mp4`);
} catch (error) {
    console.log("Some unexpected error occured");
}
