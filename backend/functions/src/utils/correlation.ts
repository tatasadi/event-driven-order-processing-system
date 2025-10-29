import { HttpRequest, InvocationContext } from '@azure/functions'

export const CORRELATION_ID_HEADER = 'x-correlation-id'

/**
 * Extract or generate correlation ID from request
 */
export function getCorrelationId(request: HttpRequest, context: InvocationContext): string {
	// Try to get from header
	const headerValue = request.headers.get(CORRELATION_ID_HEADER)
	if (headerValue) {
		context.log(`Using correlation ID from header: ${headerValue}`)
		return headerValue
	}

	// Try to get from query
	const queryValue = request.query.get('correlationId')
	if (queryValue) {
		context.log(`Using correlation ID from query: ${queryValue}`)
		return queryValue
	}

	// Generate new one
	const newId = generateCorrelationId()
	context.log(`Generated new correlation ID: ${newId}`)
	return newId
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 15)
	return `${timestamp}-${random}`
}

/**
 * Add correlation ID to response headers
 */
export function addCorrelationHeader(
	headers: Record<string, string>,
	correlationId: string,
): Record<string, string> {
	return {
		...headers,
		[CORRELATION_ID_HEADER]: correlationId,
	}
}
