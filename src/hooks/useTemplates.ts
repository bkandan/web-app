import { useEffect, useRef } from 'react';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { setIsRefreshingTemplates } from '@src/store/reducers/isRefreshingTemplatesReducer';
import { AXIOS_ERROR_CODE_TIMEOUT } from '@src/Constants';
import { useAppDispatch } from '@src/store/hooks';
import { AxiosError } from 'axios';
import {
	checkTemplateRefreshStatus,
	fetchTemplates,
	issueTemplateRefreshRequest,
} from '@src/api/templatesApi';
import { TemplateList } from '@src/types/templates';

const MAX_RETRY = 15;
const RETRY_DELAY = 1000;

const useTemplates = () => {
	const retryCount = useRef(0);

	const dispatch = useAppDispatch();

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		abortControllerRef.current = new AbortController();

		return () => {
			// Cancelling ongoing requests
			abortControllerRef.current?.abort();
		};
	}, []);

	const handleIssueTemplateRefreshRequest = async () => {
		dispatch(setIsRefreshingTemplates(true));

		try {
			await issueTemplateRefreshRequest();
			await handleCheckTemplateRefreshStatus();
			console.log('Issued a template refresh request.');
		} catch (error: any | AxiosError) {
			console.log(error);
			console.log('Failed to issue a template refresh request.');
			dispatch(setIsRefreshingTemplates(false));
			window.displayCustomError(
				'Failed to issue a template refresh request. Please try again in a while.'
			);
		}
	};

	const handleCheckTemplateRefreshStatus = async () => {
		console.log('Checking template refresh status...');

		const errorCallback = () => {
			if (retryCount.current < MAX_RETRY) {
				retryCount.current = retryCount.current + 1;

				console.log(
					'Retrying, attempt: ' + retryCount.current + '/' + MAX_RETRY
				);

				setTimeout(() => {
					handleCheckTemplateRefreshStatus();
				}, RETRY_DELAY);
			} else {
				console.log('Too many attempts to refresh templates!');
				dispatch(setIsRefreshingTemplates(false));
				retryCount.current = 0;

				window.displayCustomError(
					'Too many attempts to refresh templates! Please try again in a while.'
				);
			}
		};

		try {
			const data = await checkTemplateRefreshStatus(
				abortControllerRef.current?.signal
			);
			if (data.currently_refreshing) {
				console.log('Templates are still being refreshed.');
				errorCallback();
			} else {
				console.log('Templates are ready to be loaded.');

				retryCount.current = 0;
				await listTemplates(true);
			}
		} catch (error: any | AxiosError) {
			console.log(error);

			if (
				error.code === AXIOS_ERROR_CODE_TIMEOUT ||
				error.response?.status === 504
			) {
				errorCallback();
			} else {
				dispatch(setIsRefreshingTemplates(false));
			}
		}
	};

	const listTemplates = async (displaySuccessOnUI: boolean) => {
		try {
			const data = await fetchTemplates();
			console.log('Loaded templates successfully!');
			const templateList: TemplateList = {};
			data.results
				.filter((item) => item.status === 'approved')
				.forEach((item) => (templateList[item.name] = item));
			dispatch(setTemplates(templateList));
			dispatch(setIsRefreshingTemplates(false));

			if (displaySuccessOnUI) {
				window.displaySuccess('Templates are refreshed successfully.');
			}
		} catch (error) {
			console.log(error);
			console.log('Failed to load templates.');
			dispatch(setIsRefreshingTemplates(false));

			window.displayCustomError(
				'Failed to load templates. Please try again in a while.'
			);
		}
	};

	return {
		issueTemplateRefreshRequest: handleIssueTemplateRefreshRequest,
		listTemplates,
	};
};

export default useTemplates;
