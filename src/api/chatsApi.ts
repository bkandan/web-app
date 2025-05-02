import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Chat, FetchChatsParams } from '@src/types/chats';

export const fetchChats = async (
	params: FetchChatsParams,
	dynamic_filters?: { [key: string]: any },
	signal?: AbortSignal
) => {
	const response = await axios.get<PaginatedResponse<Chat>>('/chats/', {
		params: { ...params, ...dynamic_filters },
		signal,
	});
	return response.data;
};

export const fetchChat = async (wa_id: string) => {
	const response = await axios.get<Chat>(`/chats/${wa_id}/`);
	return response.data;
};
