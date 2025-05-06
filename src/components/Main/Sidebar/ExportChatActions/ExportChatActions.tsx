import React from 'react';
import { Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import * as Styled from './ExportChatActions.styles';

interface Props {
	onShowDateRange: () => void;
	onExport: () => void;
	onCancel: () => void;
}

const ExportChatActions: React.FC<Props> = ({
	onShowDateRange,
	onExport,
	onCancel,
}) => {
	const { t } = useTranslation();
	const { selectedTags, selectedChats } = useAppSelector((state) => state.UI);

	return (
		<Styled.Container>
			<Styled.Title>{t('Export Chats')}</Styled.Title>

			<Styled.Recipients>
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: {
							contacts_count: selectedChats.length,
							tags_count: selectedTags.length,
						},
					}}
				>
					Selected %(contacts_count)d contact(s) and %(tags_count)d tag(s).
				</Trans>
			</Styled.Recipients>

			<Styled.Actions>
				<Button color="secondary" onClick={onCancel}>
					{t('Cancel')}
				</Button>

				<Button color="primary" onClick={onShowDateRange}>
					{t('Export by date')}
				</Button>

				<Button
					color="primary"
					onClick={onExport}
					disabled={selectedChats.length === 0 && selectedTags.length === 0}
				>
					{t('Export')}
				</Button>
			</Styled.Actions>
		</Styled.Container>
	);
};

export default ExportChatActions;
