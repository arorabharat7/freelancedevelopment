import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, CardContent, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
  },
});

const Container = styled('div')({
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto',
});

const getCompetitionColor = (competition: number): string => {
  if (competition < 0.33) return 'green';
  if (competition < 0.66) return 'orange';
  return 'red';
};

const getCompetitionBorderColor = (competition: number): string => {
  if (competition < 0.33) return '2px solid green';
  if (competition < 0.66) return '2px solid orange';
  return '2px solid red';
};

interface Keyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  relatedKeywords: string[];
}

const KeywordTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('com');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [filter, setFilter] = useState({ minVolume: 0, maxVolume: Infinity });

  const fetchKeywords = async () => {
    try {
      const response = await axios.get(`/api/keywords?query=${query}&country=${country}`);
      setKeywords(response.data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, [e.target.name]: Number(e.target.value) });
  };

  const filteredKeywords = keywords.filter(keyword => 
    keyword.searchVolume >= filter.minVolume && keyword.searchVolume <= filter.maxVolume
  );

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" gutterBottom>Keyword Generator Tool</Typography>
        <div className="space-y-4">
          <TextField
            label="Enter keyword"
            variant="outlined"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <MenuItem value="com">USA (com)</MenuItem>
              <MenuItem value="co.uk">UK (co.uk)</MenuItem>
              <MenuItem value="ca">Canada (ca)</MenuItem>
              <MenuItem value="in">India (in)</MenuItem>
              {/* Add more countries as needed */}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={fetchKeywords} fullWidth>Get Keywords</Button>
          <div className="flex space-x-4">
            <TextField
              label="Min Volume"
              type="number"
              name="minVolume"
              value={filter.minVolume}
              onChange={handleFilterChange}
            />
            <TextField
              label="Max Volume"
              type="number"
              name="maxVolume"
              value={filter.maxVolume}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        {filteredKeywords.length > 0 && (
          <div className="mt-4 space-y-4">
            {filteredKeywords.map((keyword, index) => (
              <Card 
                key={index} 
                style={{ 
                  backgroundColor: getCompetitionColor(keyword.competition),
                  border: getCompetitionBorderColor(keyword.competition)
                }}
              >
                <CardContent>
                  <Typography variant="h6">{keyword.keyword}</Typography>
                  <Typography>Search Volume: {keyword.searchVolume}</Typography>
                  <Typography>CPC: ${keyword.cpc}</Typography>
                  <Typography>Competition: {keyword.competition}</Typography>
                  <div>
                    <Typography variant="subtitle1">Related Keywords:</Typography>
                    {keyword.relatedKeywords.map((relatedKeyword, i) => (
                      <Typography key={i}>{relatedKeyword}</Typography>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default KeywordTool;
