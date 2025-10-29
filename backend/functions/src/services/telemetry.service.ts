import * as appInsights from 'applicationinsights'
import { InvocationContext } from '@azure/functions'
import { KnownSeverityLevel } from 'applicationinsights'

export interface CustomProperties {
	[key: string]: string | number | boolean
}

export interface CustomMetrics {
	[key: string]: number
}

export class TelemetryService {
	private static client: appInsights.TelemetryClient | null = null
	private correlationId: string

	constructor(private context: InvocationContext, correlationId?: string) {
		this.correlationId = correlationId || this.generateCorrelationId()
		TelemetryService.initialize()
	}

	/**
	 * Initialize Application Insights client
	 */
	private static initialize(): void {
		if (!TelemetryService.client) {
			const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING

			if (!connectionString) {
				console.warn('Application Insights connection string not configured')
				return
			}

			appInsights
				.setup(connectionString)
				.setAutoCollectRequests(true)
				.setAutoCollectPerformance(true, true)
				.setAutoCollectExceptions(true)
				.setAutoCollectDependencies(true)
				.setAutoCollectConsole(true)
				.setUseDiskRetryCaching(true)
				.setSendLiveMetrics(true)
				.start()

			TelemetryService.client = appInsights.defaultClient
			console.log('Application Insights initialized')
		}
	}

	/**
	 * Track custom event
	 */
	trackEvent(name: string, properties?: CustomProperties, metrics?: CustomMetrics): void {
		this.context.log(`Custom Event: ${name}`, properties)

		if (TelemetryService.client) {
			TelemetryService.client.trackEvent({
				name,
				properties: {
					...properties,
					correlationId: this.correlationId,
					invocationId: this.context.invocationId,
					functionName: this.context.functionName,
				} as any,
				measurements: metrics,
			})
		}
	}

	/**
	 * Track custom metric
	 */
	trackMetric(name: string, value: number, properties?: CustomProperties): void {
		this.context.log(`Custom Metric: ${name} = ${value}`, properties)

		if (TelemetryService.client) {
			TelemetryService.client.trackMetric({
				name,
				value,
				properties: {
					...properties,
					correlationId: this.correlationId,
				} as any,
			})
		}
	}

	/**
	 * Track dependency call
	 */
	trackDependency(
		name: string,
		type: string,
		data: string,
		duration: number,
		success: boolean,
		properties?: CustomProperties,
	): void {
		this.context.log(
			`Dependency: ${name} (${type}) - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`,
		)

		if (TelemetryService.client) {
			TelemetryService.client.trackDependency({
				name,
				dependencyTypeName: type,
				data,
				duration,
				success,
				resultCode: success ? 200 : 500,
				properties: {
					...properties,
					correlationId: this.correlationId,
				} as any,
			})
		}
	}

	/**
	 * Track exception with context
	 */
	trackException(
		error: Error,
		properties?: CustomProperties,
		severityLevel?: KnownSeverityLevel,
	): void {
		this.context.error('Exception tracked:', error.message)

		if (TelemetryService.client) {
			TelemetryService.client.trackException({
				exception: error,
				properties: {
					...properties,
					correlationId: this.correlationId,
					invocationId: this.context.invocationId,
					functionName: this.context.functionName,
				} as any,
				severity: severityLevel || KnownSeverityLevel.Error,
			})
		}
	}

	/**
	 * Track trace (structured log)
	 */
	trackTrace(
		message: string,
		severityLevel: KnownSeverityLevel = KnownSeverityLevel.Information,
		properties?: CustomProperties,
	): void {
		if (TelemetryService.client) {
			TelemetryService.client.trackTrace({
				message,
				severity: severityLevel,
				properties: {
					...properties,
					correlationId: this.correlationId,
					invocationId: this.context.invocationId,
					functionName: this.context.functionName,
				} as any,
			})
		}
	}

	/**
	 * Flush telemetry (important for Azure Functions)
	 */
	async flush(): Promise<void> {
		if (TelemetryService.client) {
			await TelemetryService.client.flush()
		}
	}

	/**
	 * Get correlation ID for distributed tracing
	 */
	getCorrelationId(): string {
		return this.correlationId
	}

	/**
	 * Generate correlation ID
	 */
	private generateCorrelationId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(7)}`
	}
}
