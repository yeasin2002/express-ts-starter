import { Category } from "./models/category.model";
import { Certification } from "./models/certification.model";
import { Experience } from "./models/experience.model";
import { JobApplicationRequest } from "./models/job-application-request.model";
import { Job } from "./models/job.model";
import { Location } from "./models/location.model";
import { Review } from "./models/review.model";
import { User } from "./models/user.model";
import { WorkSample } from "./models/work-samples.model";

export const db = {
	user: User,
	category: Category,
	job: Job,
	review: Review,
	location: Location,
	jobApplicationRequest: JobApplicationRequest,
	experience: Experience,
	workSample: WorkSample,
	certification: Certification,
};
