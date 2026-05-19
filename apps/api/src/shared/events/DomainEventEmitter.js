import { EventEmitter } from "events";
import logger from "../logger/logger.js";

/**
 * DomainEventEmitter — typed in-process event bus.
 * Decouples modules: e.g. when an issue is approved, IssueService emits
 * DOMAIN_EVENTS.ISSUE_APPROVED and NotificationService listens to it.
 *
 * Usage:
 *   // Emit (in issue.service.js):
 *   domainEvents.emit(DOMAIN_EVENTS.ISSUE_APPROVED, { issueId, developerId });
 *
 *   // Listen (in notification.service.js):
 *   domainEvents.on(DOMAIN_EVENTS.ISSUE_APPROVED, async ({ issueId, developerId }) => { ... });
 */
class DomainEventEmitter extends EventEmitter {
    constructor() {
        super();
        // Prevent crashes from unhandled events
        this.on("error", (err) => {
            logger.error({ err }, "DomainEventEmitter unhandled error");
        });
    }

    /**
     * Emit with automatic error catching for async listeners.
     * @param {string} event
     * @param {*}      payload
     */
    emitAsync(event, payload) {
        const listeners = this.listeners(event);
        listeners.forEach((listener) => {
            Promise.resolve(listener(payload)).catch((err) => {
                logger.error({ err, event }, "DomainEvent async listener error");
            });
        });
    }
}

// Singleton — shared across the entire application
export const domainEvents = new DomainEventEmitter();
