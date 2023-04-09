import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container,
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import Image from 'mui-image'
import Collapse from '@mui/material/Collapse';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { Switch, FormControlLabel } from '@mui/material';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [jobId, setJobId] = useState(null);
  const { createJob, getJobStatus } = api;
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState(prefersDarkMode ? 'dark' : 'light');

  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [numInferenceSteps, setNumInferenceSteps] = useState(50);
  const [numOutputs, setNumOutputs] = useState(1);
  const [promptStrength, setPromptStrength] = useState(0.8);
  const [scheduler, setScheduler] = useState('EULER-A');
  const [seed, setSeed] = useState('-1');
  const [negativePrompt, setNegativePrompt] = useState('');

  useEffect(() => {
    setThemeMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: themeMode === 'dark' ? '#7289da' : '#3f51b5',
          },
          background: {
            default: themeMode === 'dark' ? '#36393f' : '#f5f5f5',
            paper: themeMode === 'dark' ? '#424449' : '#ffffff',
          },
        },
      }),
    [themeMode],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const inputSettings = {
      prompt,
      negative_prompt: negativePrompt,
      width: parseInt(width),
      height: parseInt(height),
      guidance_scale: parseFloat(guidanceScale),
      num_inference_steps: parseInt(numInferenceSteps),
      num_outputs: parseInt(numOutputs),
      prompt_strength: parseFloat(promptStrength),
      scheduler,
    };

    if (seed) {
      inputSettings.seed = parseInt(seed);
    }
    const job = await createJob(apiKey, inputSettings);
    const currentJobId = job.id;
    setJobId(currentJobId);

    let status = await getJobStatus(apiKey, currentJobId);
    if (status.retries > 0) {
      setError('An error occurred during the API call. Please try again.');
      setIsLoading(false);
      return;
    }
  
    while (status.status !== 'COMPLETED') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      status = await getJobStatus(apiKey, currentJobId);
    }
  
    setImages(status.output.map((img) => img.image));
    setIsLoading(false);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Container sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                  color="primary"
                />
              }
              label="Dark mode"
            />
          </Box>


          <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
        Stable Diffusion v1.5
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Negative Prompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit" disabled={isLoading}>
            Generate Images
          </Button>
        </Box>
        <Box mt={2}>
          <Button variant="outlined" color="primary" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </Button>
        </Box>
      </form>
      {jobId && (
        <Typography variant="body1" component="p" gutterBottom>
          Job ID: {jobId}
        </Typography>
      )}
      {error && (
        <Typography variant="body1" component="p" color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {isLoading && <CircularProgress />}
      <Grid container spacing={2} mt={4}>
        {images.map((img, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Image src={img} alt="Generated" sx={{ width: '100%', height: 'auto' }} />
          </Grid>
        ))}
      </Grid>
      <Collapse in={showAdvanced}>
        <Box mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Width"
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height"
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guidance Scale"
                type="number"
                step="0.1"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Inference Steps"
                type="number"
                value={numInferenceSteps}
                onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Outputs"
                type="number"
                value={numOutputs}
                onChange={(e) => setNumOutputs(parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
            fullWidth
            label="Prompt Strength"
            type="number"
            step="0.1"
            value={promptStrength}
            onChange={(e) => setPromptStrength(parseFloat(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Scheduler</InputLabel>
            <Select
              value={scheduler}
              onChange={(e) => setScheduler(e.target.value)}
            >
              <MenuItem value="DDIM">DDIM</MenuItem>
              <MenuItem value="DDPM">DDPM</MenuItem>
              <MenuItem value="DPM-M">DPM-M</MenuItem>
              <MenuItem value="DPM-S">DPM-S</MenuItem>
              <MenuItem value="EULER-A">EULER-A</MenuItem>
              <MenuItem value="EULER-D">EULER-D</MenuItem>
              <MenuItem value="HEUN">HEUN</MenuItem>
              <MenuItem value="IPNDM">IPNDM</MenuItem>
              <MenuItem value="KDPM2-A">KDPM2-A</MenuItem>
              <MenuItem value="KDPM2-D">KDPM2-D</MenuItem>
              <MenuItem value="PNDM">PNDM</MenuItem>
              <MenuItem value="K-LMS">K-LMS</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Random Seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
          />
        </Grid>
      </Grid>
    </Box>
  </Collapse>
</Box>
</Container>
</Box>
</ThemeProvider>
);
};

export default App;
