import { useState } from 'react';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { useAppSelector } from '@src/store/hooks';
import ReactionList from '@src/interfaces/ReactionList';
import { getMessageTimestamp } from '@src/helpers/MessageHelper';

interface Props {
	MESSAGES_PER_PAGE: number;
}

const useChat = ({ MESSAGES_PER_PAGE }: Props) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const users = useAppSelector((state) => state.users.value);
	const templates = useAppSelector((state) => state.templates.value);
	const savedResponses = useAppSelector((state) => state.savedResponses.value);

	const [messages, setMessages] = useState<ChatMessageList>({});
	const [reactions, setReactions] = useState<ReactionList>({});

	const [fixedDateIndicatorText, setFixedDateIndicatorText] =
		useState<string>();

	const isTimestampsSame = (checkInReverse: boolean = false): boolean => {
		const messagesArray = Object.values(messages);
		if (checkInReverse) messagesArray.reverse();
		let previousTimestamp = -1;
		let isSame = true;
		for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
			const message = messagesArray[i];
			if (!message) {
				isSame = false;
				break;
			}

			if (i === 0) {
				previousTimestamp = getMessageTimestamp(message) ?? -1;
			} else {
				if (getMessageTimestamp(message) !== previousTimestamp) {
					isSame = false;
					break;
				}

				previousTimestamp = getMessageTimestamp(message) ?? -1;
			}
		}

		return isSame;
	};

	function mergeReactionLists(
		prevState: ReactionList,
		preparedReactions: ReactionList
	): ReactionList {
		const mergedReactions: ReactionList = { ...prevState };

		for (const key in preparedReactions) {
			if (preparedReactions.hasOwnProperty(key)) {
				if (mergedReactions[key]) {
					// Merge arrays for the same key
					mergedReactions[key] = [
						...mergedReactions[key],
						...preparedReactions[key],
					];
				} else {
					// Add the new key-value pair if it doesn't exist
					mergedReactions[key] = preparedReactions[key];
				}
			}
		}

		return mergedReactions;
	}

	const prepareFixedDateIndicator = (
		dateIndicators: NodeListOf<Element> | undefined,
		el: HTMLElement | null
	) => {
		if (!dateIndicators || !el) return;

		const curScrollTop = el.scrollTop;
		let indicatorToShow;

		for (let i = 0; i < dateIndicators.length; i++) {
			const indicator = dateIndicators[i] as HTMLElement;
			if (
				indicatorToShow === undefined ||
				indicator.offsetTop <= curScrollTop
			) {
				indicatorToShow = indicator;
			} else {
				break;
			}
		}

		if (indicatorToShow) {
			setFixedDateIndicatorText(indicatorToShow.innerHTML);
		}
	};

	return {
		currentUser,
		users,
		templates,
		savedResponses,
		messages,
		setMessages,
		reactions,
		setReactions,
		isTimestampsSame,
		mergeReactionLists,
		fixedDateIndicatorText,
		prepareFixedDateIndicator,
	};
};

export default useChat;
