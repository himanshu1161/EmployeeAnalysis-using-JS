const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const path = require('path');
const readlineSync = require('readline-sync');

/**
 * Displays the menu options for analyzing employee data.
 * 
 * @returns {void}
 */
const menu = () => {
    console.log("Menu:");
    console.log("1. Analyze 7 Consecutive Days");
    console.log("2. Analyze Hours Between Shifts");
    console.log("3. Analyze Single Shift More Than 14 Hours");
    console.log("4. Exit");
};

const analyzeEmployees = (file_path) => {
    const employees = {};

    fs.createReadStream(file_path)
        .pipe(csv())
        .on('data', (row) => {
            // Extract relevant fields from the CSV row
            const { "Employee Name": Name, "Position ID": PositionID, Time, "Timecard Hours (as Time)": HoursWorked } = row;
    
            // Create a unique key for each employee using name and position ID
            const employeeKey = `${Name}-${PositionID}`;
    
            // Initialize the employee entry if it doesn't exist
            if (!employees[employeeKey]) {
                employees[employeeKey] = { shifts: [] };
            }
    
            // Parse date and hours worked
            const date = moment(Time, 'MM/DD/YYYY hh:mm A');
            const hoursWorkedFloat = parseFloat(HoursWorked);
    
            // Save shift information in the employee's shifts array
            employees[employeeKey].shifts.push({ date, hoursWorked: hoursWorkedFloat });
        })
        .on('end', () => {
            // After parsing the CSV, run the menu-driven interface
            runMenu(employees);
        });
    
};
let foundEmployeeWithConsecutiveDays = false;

const runMenu = (employees) => {
    let choice = 0;

    while (choice !== 4) {
        menu();
        console.log("Enter your choice:");
        choice = parseInt(readlineSync.question());

        switch (choice) {
            // Analysis for finding employees who worked for 7 consecutive days.
            case 1:
                for (const [employeeKey, data] of Object.entries(employees)) {
                    const [name, positionID] = employeeKey.split('-');
                    analyzeConsecutiveDays(name, positionID, data.shifts);   
                }
                if (!foundEmployeeWithConsecutiveDays) {
                    console.log("None of the employees worked 7 consecutive days");
                }
                break;
            // Analysis for finding employees who have less than 10 hours of time between shifts but greater than 1 hour
            case 2:
                for (const [employeeKey, data] of Object.entries(employees)) {
                    const [name, positionID] = employeeKey.split('-');
                    analyzeHoursBetweenShifts(name, positionID, data.shifts);
                }
                break;
                // Analysis for finding employees who has worked for more than 14 hours in a single shift

            case 3:
                for (const [employeeKey, data] of Object.entries(employees)) {
                    const [name, positionID] = employeeKey.split('-');
                    analyzeSingleShift(name, positionID, data.shifts);
                }
                break;
            case 4:
                console.log("Exiting the program.");
                break;
            default:
                console.log("Invalid choice. Please enter a valid option.");
                break;
        }
    }
};
/**
 * Analyzes the consecutive days worked by employees.
 *
 * This function takes in an object of employees and their shifts data and analyzes the consecutive days worked by each employee.
 * It checks if an employee has worked for 7 consecutive days and prints the details if found.
 * If none of the employees have worked for 7 consecutive days, it prints a message indicating the same.
 *
 * @param {Object} employees - An object containing the employees and their shifts data.
 * @returns {void}
 */
const analyzeConsecutiveDays = (employees) => {
   

    for (const [employeeKey, data] of Object.entries(employees)) {
        const [name, positionID] = employeeKey.split('-');
        const shifts = data.shifts;

        let consecutiveDays = 0;

        if (!shifts) {
            continue;
        }

        for (let i = 1; i < shifts.length; i++) {
            const daysDiff = shifts[i].date.diff(shifts[i - 1].date, 'days');
            if (daysDiff === 1) {
                consecutiveDays++;
            } else {
                consecutiveDays = 0;
            }

            if (consecutiveDays === 6) {
                foundEmployeeWithConsecutiveDays = true;
                console.log(`${name} (Position ID: ${positionID}) has worked for 7 consecutive days starting from ${shifts[i - 6].date.format('MM/DD/YYYY')}`);
                break;
            }
        }
    }

   
};


/**
 * Analyzes the hours between shifts for a given employee.
 *
 * @param {string} name - The name of the employee.
 * @param {string} positionID - The position ID of the employee.
 * @param {Array} shifts - An array of shift objects.
 * @returns {undefined}
 */

const analyzeHoursBetweenShifts = (name, positionID, shifts) => {
    for (let i = 1; i < shifts.length; i++) {
        const hoursBetweenShifts = shifts[i].date.diff(shifts[i - 1].date, 'hours', true);
        
        if (1 < hoursBetweenShifts && hoursBetweenShifts < 10) {
            console.log(`${name} (Position ID: ${positionID}) has less than 10 hours between shifts on ${shifts[i - 1].date.format('MM/DD/YYYY')} and ${shifts[i].date.format('MM/DD/YYYY')}, but greater than 1 hour`);
        }
    }
};

/**
 * Analyzes a single shift for an employee.
 *
 * @param {string} name - The name of the employee.
 * @param {string} positionID - The position ID of the employee.
 * @param {Array} shifts - An array of shift objects.
 * @returns {undefined} - This function does not return a value.
 *
 * @example
 * analyzeSingleShift("John Doe", "12345", [{ hoursWorked: 12, date: new Date() }]);
 * // No output
 *
 * @example
 * analyzeSingleShift("Jane Smith", "54321", [{ hoursWorked: 16, date: new Date() }]);
 * // Output: "Jane Smith (Position ID: 54321) has worked more than 14 hours on MM/DD/YYYY"
 */

const analyzeSingleShift = (name, positionID, shifts) => {
    for (const shift of shifts) {
        if (shift.hoursWorked > 14) {
            console.log(`${name} (Position ID: ${positionID}) has worked more than 14 hours on ${shift.date.format('MM/DD/YYYY')}`);
        }
    }
};

const file_path = path.join(__dirname, 'Assignment_Timecard.xlsx - Sheet1.csv');
analyzeEmployees(file_path);
