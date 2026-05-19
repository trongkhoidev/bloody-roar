import applicationRepository from "./application.repository.js";
import issueRepository from "./issue.repository.js";
import { domainEvents } from "../../shared/events/DomainEventEmitter.js";
import { DOMAIN_EVENTS } from "../../shared/constants/events.constants.js";
import { NotFoundError, ConflictError, UnauthorizedError } from "../../shared/errors/errors.js";

/**
 * ApplicationService — handles the sub-domain of developer applications.
 */
export class ApplicationService {
    async applyForIssue(developer, issueId, data) {
        if (developer.role === "ADMIN") {
            throw new UnauthorizedError("Admins cannot apply for issues");
        }

        const issue = await issueRepository.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (issue.status !== "OPEN") {
            throw new ConflictError("Issue is no longer open for applications");
        }

        const existingApp = await applicationRepository.findOne({
            issue: issueId,
            developer: developer._id,
        });
        if (existingApp) throw new ConflictError("You have already applied");

        const application = await applicationRepository.create({
            issue: issueId,
            developer: developer._id,
            coverLetter: data.coverLetter,
            bidAmount: data.bidAmount || issue.bounty.amount,
        });

        // Trigger Notification via Event
        domainEvents.emit(DOMAIN_EVENTS.ISSUE_APPLIED, {
            issueId,
            issueTitle: issue.title,
            developerId: developer._id,
            developerName: developer.name,
            clientId: issue.clientId,
        });

        return application;
    }

    async getDeveloperApplications(developerId) {
        return applicationRepository.findByDeveloper(developerId);
    }

    async getIssueApplications(clientId, issueId) {
        const issue = await issueRepository.findById(issueId);
        if (!issue) throw new NotFoundError("Issue");

        if (issue.clientId.toString() !== clientId.toString()) {
            throw new UnauthorizedError("Not authorized to view applications for this issue");
        }

        return applicationRepository.findByIssue(issueId);
    }
}

export default new ApplicationService();
