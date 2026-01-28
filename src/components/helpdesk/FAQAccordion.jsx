import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQAccordion = ({ faq, onRelatedServiceClick }) => {
  const theme = useTheme();

  return (
    <Accordion
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': { display: 'none' },
        '&:hover': {
          borderColor: theme.palette.primary.main,
        },
        mb: 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={20} />}
        sx={{
          '& .MuiAccordionSummary-content': {
            my: 1.5,
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" width="100%">
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <HelpCircle size={18} />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexGrow={1} flexWrap="wrap">
            <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }}>
              {faq.question}
            </Typography>
            <Chip
              label={faq.category}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {faq.answer}
          </Typography>
          {faq.relatedService && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  borderColor: theme.palette.info.main,
                },
              }}
              onClick={() => onRelatedServiceClick(faq.relatedService)}
            >
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                📄 Related Service
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                Click to view {faq.relatedService.replace(/-/g, ' ')} details →
              </Typography>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQAccordion;
