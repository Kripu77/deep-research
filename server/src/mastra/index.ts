import { Mastra } from '@mastra/core';
import { researchWorkflow } from './workflows/researchWorkflow';
import { learningExtractionAgent } from './agents/learningExtractionAgent';
import { evaluationAgent } from './agents/evaluationAgent';
import { reportAgent } from './agents/reportAgent';
import { researchAgent } from './agents/researchAgent';
import { streamingResearchAgent } from './agents/streamingResearchAgent';
import { generateReportWorkflow } from './workflows/generateReportWorkflow';
import { PinoLogger } from '@mastra/loggers';



export const mastra = new Mastra({
  agents: { researchAgent, reportAgent, evaluationAgent, learningExtractionAgent, streamingResearchAgent },
  workflows: { generateReportWorkflow, researchWorkflow },
  logger: new PinoLogger({name:"DeepResearch", level: 'debug' }),
});
