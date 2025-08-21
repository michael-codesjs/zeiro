import { Model } from './types';

export const MODELS: Model[] = [
  // OpenAI GPT Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: ''
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: ''
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: ''
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: ''
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: ''
  },
  
  // Anthropic Claude Models
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Oct 2024)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Claude 3.5 Sonnet (Latest)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (Jun 2024)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku (Oct 2024)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku (Latest)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet (Feb 2025)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-opus-latest',
    name: 'Claude 3 Opus (Latest)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-4-opus-20250514',
    name: 'Claude 4 Opus (May 2025)',
    provider: 'Anthropic',
    description: ''
  },
  {
    id: 'claude-4-sonnet-20250514',
    name: 'Claude 4 Sonnet (May 2025)',
    provider: 'Anthropic',
    description: ''
  }
];

export const CHAT_CONFIG = {
  DEFAULT_WIDTH: 300,
  MIN_WIDTH: 300,
  MAX_WIDTH: 600,
  TYPING_SPEED: 20,
  AUTO_APPROVE_DEFAULT: true
}; 