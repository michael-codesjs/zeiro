export interface Integration {
  name: string;
  slug: string;
  logo: string;
  category: string;
  popularity: number; // 1-5 stars
  pricing: string;
  description: string;
  exportType: string;
  frequency: string;
  format: string;
  exportSteps: {
    title: string;
    description: string;
  }[];
  documentation: string;
  website: string;
}

export const integrations: Integration[] = [
  {
    name: "Slack",
    slug: "slack",
    logo: "/images/integrations/slack.png",
    category: "Communication",
    popularity: 5,
    pricing: "Free",
    description: "Send automated reports and insights directly to your Slack channels. Keep your team updated with real-time data notifications.",
    exportType: "Real-time",
    frequency: "Instant",
    format: "Message",
    exportSteps: [
      {
        title: "Connect Slack workspace",
        description: "Authorize Zeiro to access your Slack workspace and select channels."
      },
      {
        title: "Configure notifications",
        description: "Choose which insights and reports to send automatically."
      },
      {
        title: "Set schedule",
        description: "Define when and how often to receive updates in Slack."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/slack",
    website: "https://slack.com"
  },
  {
    name: "Microsoft Teams",
    slug: "microsoft-teams",
    logo: "/images/integrations/teams.png",
    category: "Communication",
    popularity: 4,
    pricing: "Free",
    description: "Share data insights and reports with your Microsoft Teams channels. Perfect for enterprise collaboration.",
    exportType: "Scheduled",
    frequency: "Daily/Weekly",
    format: "Message",
    exportSteps: [
      {
        title: "Connect Teams account",
        description: "Link your Microsoft Teams workspace to Zeiro."
      },
      {
        title: "Select channels",
        description: "Choose which Teams channels should receive reports."
      },
      {
        title: "Customize reports",
        description: "Configure the format and content of your automated reports."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/teams",
    website: "https://teams.microsoft.com"
  },
  {
    name: "Google Sheets",
    slug: "google-sheets",
    logo: "/images/integrations/google-sheets.png",
    category: "Spreadsheet",
    popularity: 5,
    pricing: "Free",
    description: "Export your data analysis results directly to Google Sheets for further manipulation and sharing with stakeholders.",
    exportType: "Batch",
    frequency: "On-demand",
    format: "CSV/Excel",
    exportSteps: [
      {
        title: "Authorize Google account",
        description: "Grant Zeiro permission to access your Google Sheets."
      },
      {
        title: "Create or select sheet",
        description: "Choose an existing sheet or create a new one for your data."
      },
      {
        title: "Map data fields",
        description: "Define how your Zeiro data should be structured in the sheet."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/google-sheets",
    website: "https://sheets.google.com"
  },
  {
    name: "Microsoft Excel",
    slug: "microsoft-excel",
    logo: "/images/integrations/excel.png",
    category: "Spreadsheet",
    popularity: 4,
    pricing: "Free",
    description: "Export analysis results to Excel format for advanced data manipulation and presentation to stakeholders.",
    exportType: "Batch",
    frequency: "On-demand",
    format: "Excel",
    exportSteps: [
      {
        title: "Select data range",
        description: "Choose which data and time period to export."
      },
      {
        title: "Configure format",
        description: "Set up column headers, formatting, and data structure."
      },
      {
        title: "Download file",
        description: "Generate and download your Excel file with the exported data."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/excel",
    website: "https://office.microsoft.com/excel"
  },
  {
    name: "Gmail",
    slug: "gmail",
    logo: "/images/integrations/gmail.png",
    category: "Communication",
    popularity: 5,
    pricing: "Free",
    description: "Send automated email reports and data insights directly to Gmail. Perfect for stakeholder updates and notifications.",
    exportType: "Scheduled",
    frequency: "Daily/Weekly",
    format: "Email",
    exportSteps: [
      {
        title: "Connect Gmail account",
        description: "Authorize Zeiro to send emails through your Gmail account."
      },
      {
        title: "Set up recipients",
        description: "Define who should receive automated reports and notifications."
      },
      {
        title: "Configure email templates",
        description: "Customize the format and content of your automated emails."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/gmail",
    website: "https://gmail.com"
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    logo: "/images/integrations/hubspot.png",
    category: "CRM",
    popularity: 4,
    pricing: "Pro",
    description: "Sync customer data and insights directly to HubSpot CRM. Enhance your sales and marketing workflows with data-driven insights.",
    exportType: "API",
    frequency: "Real-time",
    format: "JSON",
    exportSteps: [
      {
        title: "Connect HubSpot account",
        description: "Link your HubSpot CRM to Zeiro using API credentials."
      },
      {
        title: "Map data fields",
        description: "Define how Zeiro data should be structured in HubSpot."
      },
      {
        title: "Set sync rules",
        description: "Configure when and what data should be synchronized."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/hubspot",
    website: "https://hubspot.com"
  },
  {
    name: "Salesforce",
    slug: "salesforce",
    logo: "/images/integrations/salesforce.png",
    category: "CRM",
    popularity: 4,
    pricing: "Enterprise",
    description: "Push customer insights and analytics directly to Salesforce. Empower your sales team with data-driven customer intelligence.",
    exportType: "API",
    frequency: "Real-time",
    format: "JSON",
    exportSteps: [
      {
        title: "Authenticate Salesforce",
        description: "Connect your Salesforce org using OAuth or API credentials."
      },
      {
        title: "Configure object mapping",
        description: "Map Zeiro data to Salesforce objects and fields."
      },
      {
        title: "Set up automation",
        description: "Define triggers and rules for automatic data synchronization."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/salesforce",
    website: "https://salesforce.com"
  },
  {
    name: "WhatsApp",
    slug: "whatsapp",
    logo: "/images/integrations/whatsapp.png",
    category: "Communication",
    popularity: 4,
    pricing: "Pro",
    description: "Send instant notifications and reports via WhatsApp Business. Keep your team updated with real-time data alerts.",
    exportType: "Real-time",
    frequency: "Instant",
    format: "Message",
    exportSteps: [
      {
        title: "Set up WhatsApp Business",
        description: "Connect your WhatsApp Business account to Zeiro."
      },
      {
        title: "Configure recipients",
        description: "Add team members and groups to receive notifications."
      },
      {
        title: "Customize alerts",
        description: "Define what triggers should send WhatsApp notifications."
      }
    ],
    documentation: "https://docs.zeiro.com/integrations/whatsapp",
    website: "https://business.whatsapp.com"
  }
];

export function getIntegration(slug: string): Integration | undefined {
  return integrations.find(integration => integration.slug === slug);
}

export function getAllIntegrations(): Integration[] {
  return integrations;
}
