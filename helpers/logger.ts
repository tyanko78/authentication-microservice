// Importing required modules
import * as fs from 'fs'
import cron from 'node-cron'
import * as dotenv from 'dotenv'

// Loading environment variables
dotenv.config()

// Destructuring environment variables
const { LOG_LEVEL, LOG_HISTORY, LOG_NAME } = process.env

// Defining log types and corresponding colors
const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG']
const logColors = ['36m', '33m', '31m', '32m']

// Parsing log count and level from environment variables
const logCount = parseInt(LOG_HISTORY || '7', 10)
const logLevel = parseInt(LOG_LEVEL || '0', 10)

// Scheduling a cron job to rotate logs at midnight every day
export const logRotationJob = cron.schedule('0 0 * * *', function () {
  for (const type of logTypes) {
    if (logTypes.indexOf(type) < logLevel) continue

    const fileName = `./log/${LOG_NAME}.${type.toLowerCase()}`

    for (let i = logCount; i >= 0; i--) {
      const logFile = `${fileName}.${i === 0 ? '' : `${i}.`}log`

      if (!fs.existsSync(logFile)) continue

      // Log rotation logic
      const newLogFile = `${fileName}.${i + 1}.log`
      fs.renameSync(logFile, newLogFile)
    }

    // Start a new log file
    fs.writeFileSync(`${fileName}.log`, '')
  }
})

// Exporting the log function
export default function log (type: number, message: string) {
  // If the log type is less than the log level, return
  if (type < logLevel) return

  // Getting the current date and time
  const now = Date.now()
  const date = Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/London',
  }).format(now)
  const time = Intl.DateTimeFormat('en-GB', { timeStyle: 'medium', hour12: false, timeZone: 'Europe/London' }).format(
    now,
  )

  // Logging the message with type, date, and time
  console.log(`[\x1b[${logColors[type]}${logTypes[type]}${'\x1b[0m'}] ${date} ${time} - ${message}\x1b[0m`)

  // Appending the message to the log file
  fs.appendFileSync(`./log/${LOG_NAME}.${logTypes[type].toLowerCase()}.log`, `${date} ${time}: ${message}\r\n`)
}
