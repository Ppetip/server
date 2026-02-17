import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { getStats, updateAdminConfig, resetSystem, getAdminConfig } from "./lib/db";

const clearScreen = () => process.stdout.write('\x1Bc');

const header = () => {
    clearScreen();
    console.log(chalk.cyan(figlet.textSync("SECURE UPLINK", { horizontalLayout: "full" })));
    console.log(chalk.gray("Admin Command Interface v1.0"));
    console.log(chalk.gray("--------------------------------------------------"));
};

const mainMenu = async () => {
    header();

    const choices = [
        { name: "View Live Statistics", value: "stats" },
        { name: "Update Configuration", value: "config" },
        { name: "Reset System (DANGER)", value: "reset" },
        new inquirer.Separator(),
        { name: "Exit", value: "exit" }
    ];

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Select Protocol:",
            choices
        }
    ]);

    switch (action) {
        case "stats":
            await showStats();
            break;
        case "config":
            await updateConfig();
            break;
        case "reset":
            await handleReset();
            break;
        case "exit":
            console.log(chalk.green("Session Terminated."));
            process.exit(0);
    }
};

const showStats = async () => {
    header();
    console.log(chalk.yellow("Fetching data..."));

    try {
        const stats = await getStats();
        header();

        console.log(chalk.bold("LIVE METRICS:\n"));
        console.log(`Real Submissions:   ${chalk.green(stats.realCount)}`);
        console.log(`Fibbed Count:       ${chalk.cyan(stats.fibbedCount)}`);
        console.log(`Offset (Fib):       ${chalk.magenta(stats.config.countOffset)}`);
        console.log(`Donation Goal:      $${stats.config.donationGoal}`);
        console.log(`Current Donations:  $${stats.config.donationCurrent}`);

        console.log("\n");
        await inquirer.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
        mainMenu();
    } catch (e: any) {
        console.log(chalk.red("Error fetching stats: " + e.message));
        await inquirer.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
        mainMenu();
    }
};

const updateConfig = async () => {
    header();
    console.log(chalk.yellow("Fetching current config..."));
    const config = await getAdminConfig();

    const answers = await inquirer.prompt([
        {
            type: "number",
            name: "donationGoal",
            message: "Donation Goal ($):",
            default: config.donationGoal
        },
        {
            type: "number",
            name: "donationCurrent",
            message: "Current Donation Amount ($):",
            default: config.donationCurrent
        },
        {
            type: "input",
            name: "donationLink",
            message: "Donation Link:",
            default: config.donationLink
        },
        {
            type: "number",
            name: "countOffset",
            message: "Submission Count Offset (Fib):",
            default: config.countOffset
        }
    ]);

    try {
        await updateAdminConfig(answers);
        console.log(chalk.green("\nConfiguration Updated Successfully!"));
    } catch (e: any) {
        console.log(chalk.red("\nUpdate Failed: " + e.message));
    }

    await inquirer.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
    mainMenu();
};

const handleReset = async () => {
    header();
    console.log(chalk.bgRed.white.bold(" WARNING: THIS WILL DELETE ALL SUBMISSIONS "));

    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Are you absolutely sure you want to wipe the database?",
            default: false
        }
    ]);

    if (confirm) {
        try {
            await resetSystem();
            console.log(chalk.green("\nSystem Reset Complete. Database wiped."));
        } catch (e: any) {
            console.log(chalk.red("\nReset Failed: " + e.message));
        }
    } else {
        console.log(chalk.yellow("\nOperation Aborted."));
    }

    await inquirer.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
    mainMenu();
};

// Start App
mainMenu();
