"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const db_1 = require("./lib/db");
const clearScreen = () => process.stdout.write('\x1Bc');
const header = () => {
    clearScreen();
    console.log(chalk_1.default.cyan(figlet_1.default.textSync("SECURE UPLINK", { horizontalLayout: "full" })));
    console.log(chalk_1.default.gray("Admin Command Interface v1.0"));
    console.log(chalk_1.default.gray("--------------------------------------------------"));
};
const mainMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    header();
    const choices = [
        { name: "View Live Statistics", value: "stats" },
        { name: "Update Configuration", value: "config" },
        { name: "Reset System (DANGER)", value: "reset" },
        new inquirer_1.default.Separator(),
        { name: "Exit", value: "exit" }
    ];
    const { action } = yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "action",
            message: "Select Protocol:",
            choices
        }
    ]);
    switch (action) {
        case "stats":
            yield showStats();
            break;
        case "config":
            yield updateConfig();
            break;
        case "reset":
            yield handleReset();
            break;
        case "exit":
            console.log(chalk_1.default.green("Session Terminated."));
            process.exit(0);
    }
});
const showStats = () => __awaiter(void 0, void 0, void 0, function* () {
    header();
    console.log(chalk_1.default.yellow("Fetching data..."));
    try {
        const stats = yield (0, db_1.getStats)();
        header();
        console.log(chalk_1.default.bold("LIVE METRICS:\n"));
        console.log(`Real Submissions:   ${chalk_1.default.green(stats.realCount)}`);
        console.log(`Fibbed Count:       ${chalk_1.default.cyan(stats.fibbedCount)}`);
        console.log(`Offset (Fib):       ${chalk_1.default.magenta(stats.config.countOffset)}`);
        console.log(`Donation Goal:      $${stats.config.donationGoal}`);
        console.log(`Current Donations:  $${stats.config.donationCurrent}`);
        console.log("\n");
        yield inquirer_1.default.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
        mainMenu();
    }
    catch (e) {
        console.log(chalk_1.default.red("Error fetching stats: " + e.message));
        yield inquirer_1.default.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
        mainMenu();
    }
});
const updateConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    header();
    console.log(chalk_1.default.yellow("Fetching current config..."));
    const config = yield (0, db_1.getAdminConfig)();
    const answers = yield inquirer_1.default.prompt([
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
        yield (0, db_1.updateAdminConfig)(answers);
        console.log(chalk_1.default.green("\nConfiguration Updated Successfully!"));
    }
    catch (e) {
        console.log(chalk_1.default.red("\nUpdate Failed: " + e.message));
    }
    yield inquirer_1.default.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
    mainMenu();
});
const handleReset = () => __awaiter(void 0, void 0, void 0, function* () {
    header();
    console.log(chalk_1.default.bgRed.white.bold(" WARNING: THIS WILL DELETE ALL SUBMISSIONS "));
    const { confirm } = yield inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Are you absolutely sure you want to wipe the database?",
            default: false
        }
    ]);
    if (confirm) {
        try {
            yield (0, db_1.resetSystem)();
            console.log(chalk_1.default.green("\nSystem Reset Complete. Database wiped."));
        }
        catch (e) {
            console.log(chalk_1.default.red("\nReset Failed: " + e.message));
        }
    }
    else {
        console.log(chalk_1.default.yellow("\nOperation Aborted."));
    }
    yield inquirer_1.default.prompt([{ type: "input", name: "continue", message: "Press Enter to return..." }]);
    mainMenu();
});
// Start App
mainMenu();
