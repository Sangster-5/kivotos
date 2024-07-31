export function getMonthName(monthNumber: number): string {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // The month in the input string is 1-based, while our array is 0-based.
    return monthNames[monthNumber - 1];
}