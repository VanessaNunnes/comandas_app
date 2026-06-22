import { Box, Button, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const Pagination = ({ currentPage = 1, itemsPerPage = 10, onPageChange, onItemsPerPageChange, loading = false, hasItems = true }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (hasItems) onPageChange(currentPage + 1);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          startIcon={<ChevronLeft />}
          onClick={handlePrev}
          disabled={loading || currentPage <= 1}
        >
          Anterior
        </Button>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Página {currentPage}
        </Typography>
        <Button
          size="small"
          endIcon={<ChevronRight />}
          onClick={handleNext}
          disabled={loading || !hasItems}
        >
          Próxima
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">Itens por página:</Typography>
        <FormControl size="small">
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={loading}
          >
            {[5, 10, 25, 50].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Pagination;
