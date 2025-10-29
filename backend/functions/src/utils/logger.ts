import { InvocationContext } from '@azure/functions'

export enum LogLevel {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
}

export interface LogMetadata {
	[key: string]: any
}

export class Logger {
	constructor(private context: InvocationContext) {}

	info(message: string, metadata?: LogMetadata): void {
		this.log(LogLevel.INFO, message, metadata)
	}

	warn(message: string, metadata?: LogMetadata): void {
		this.log(LogLevel.WARN, message, metadata)
	}

	error(message: string, error?: Error, metadata?: LogMetadata): void {
		const errorMetadata = {
			...metadata,
			errorMessage: error?.message,
			errorStack: error?.stack,
		}
		this.log(LogLevel.ERROR, message, errorMetadata)
	}

	private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
		const logEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			invocationId: this.context.invocationId,
			functionName: this.context.functionName,
			...metadata,
		}

		const logString = JSON.stringify(logEntry)

		switch (level) {
			case LogLevel.ERROR:
				this.context.error(logString)
				break
			case LogLevel.WARN:
				this.context.warn(logString)
				break
			default:
				this.context.log(logString)
		}
	}
}
