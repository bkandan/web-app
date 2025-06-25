import React, { useContext } from 'react';
import { Button } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { Message } from '@src/types/messages';

interface Props {
	data: Message;
}

const ChatMessageLocation: React.FC<Props> = ({ data }) => {
	const config = useContext(AppConfigContext);

	const location = data.waba_payload?.location;
	const mapEmbedURL = `https://www.google.com/maps/embed/v1/place?key=${config?.APP_GOOGLE_MAPS_API_KEY}&&q=${location?.latitude},${location?.longitude}&q=`;
	const mapURL = `https://www.google.com/maps/place/${location?.latitude},${location?.longitude}`;

	const share = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ url: mapURL });
			} catch (e: any) {
				if (e.toString().includes('AbortError')) {
					console.log('Ignored AbortError.');
				} else {
					window.displayCustomError(e.toString());
				}
			}
		} else if (navigator.clipboard) {
			await navigator.clipboard.writeText(mapURL);
			window.displaySuccess('Copied!');
		} else {
			console.log('HTTPS is required for this feature!');
		}
	};

	return (
		<div className="chat__location">
			<iframe
				className="chat__location__iframe"
				width="250"
				height="150"
				loading="lazy"
				allowFullScreen
				referrerPolicy="no-referrer-when-downgrade"
				src={mapEmbedURL}
			/>

			{data.waba_payload?.location && (
				<>
					{data.waba_payload?.location.name && (
						<div className="chat__message__location__name">
							{data.waba_payload.location.name}
						</div>
					)}
					{data.waba_payload.location.address && (
						<div className="chat__message__location__address">
							{data.waba_payload.location.address}
						</div>
					)}
				</>
			)}

			<Button
				className="chat__message__location__share"
				color="primary"
				variant="outlined"
				size="small"
				disableElevation
				startIcon={<ShareIcon />}
				onClick={share}
			>
				Share
			</Button>
		</div>
	);
};

export default ChatMessageLocation;
