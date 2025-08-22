# Learning VI Chat Interface Development Prompt

Create a sophisticated AI chat interface system called "Learning VI" with the following comprehensive requirements:

## Core Architecture Requirements

### 1. Chat Interface Framework
- Build a modern, responsive chat UI similar to ChatGPT/Claude
- Support real-time messaging with typing indicators
- Message history persistence and search functionality
- Multi-session management with conversation branching
- Export/import conversation capabilities
- Dark/light theme support with customizable UI

### 2. AI Model Management System
```javascript
// Example model routing logic needed
const modelRouter = {
  'code:': ['codellama', 'deepseek-coder', 'gpt-4-code'],
  'research:': ['perplexity', 'claude-3', 'gpt-4-turbo'],
  'creative:': ['claude-3', 'gpt-4', 'gemini-pro'],
  'analysis:': ['claude-3', 'gpt-4-analysis', 'llama-2-70b']
}
```

- Dynamic model selection based on keyword prefixes (code:, research:, creative:, etc.)
- Model performance tracking and automatic optimization
- Fallback model chains for reliability
- Custom model configuration and fine-tuning support
- Load balancing across multiple model instances

### 3. Internet Research Integration
- Web scraping and content extraction capabilities
- Search engine integration (Google, Bing, academic databases)
- Automatic fact-checking and source verification
- Research result caching and indexing on NAS storage
- Citation and reference management
- Real-time information updates and monitoring

### 4. PulseLedger Storage System Integration

**Learning VI Domain Ledger Architecture**
```python
# Learning VI specific ledgers using your PulseLedger system
from pulse_ledgers import PulseLedgerFactory, PulseLedgerDomain, DomainLedgerType

learning_vi_ledgers = {
    # Conversation and interaction tracking
    'conversations': PulseLedgerFactory.create_domain_ledger(
        domain=PulseLedgerDomain.INTEGRATION,
        ledger_type=DomainLedgerType.API_LOGS,
        storage_path="/data/learning_vi"
    ),
    
    # Research and knowledge acquisition
    'research': PulseLedgerFactory.create_custom_ledger(
        domain="learning_vi",
        ledger_name="research_cache",
        storage_path="/data/learning_vi"
    ),
    
    # Code generation and project tracking
    'code_projects': PulseLedgerFactory.create_domain_ledger(
        domain=PulseLedgerDomain.PROJECTS,
        ledger_type=DomainLedgerType.PROJECTS,
        storage_path="/data/learning_vi"
    ),
    
    # Model performance and routing decisions
    'model_analytics': PulseLedgerFactory.create_custom_ledger(
        domain="learning_vi",
        ledger_name="model_performance",
        storage_path="/data/learning_vi"
    ),
    
    # User preferences and learning patterns
    'user_intelligence': PulseLedgerFactory.create_custom_ledger(
        domain="learning_vi",
        ledger_name="user_patterns",
        storage_path="/data/learning_vi"
    )
}
```

**Learning VI Ledger Entry Examples**
```python
# Conversation entry
conversation_entry = {
    'type': 'conversation',
    'category': 'user_interaction',
    'source': 'chat_interface',
    'payload': {
        'user_query': 'Build me an OS',
        'model_selected': 'deepseek-coder',
        'response_quality': 9.2,
        'execution_time': 2.3,
        'tokens_used': 1850
    },
    'actor': {'user_id': 'user_001', 'session_id': 'sess_abc123'}
}

# Research cache entry
research_entry = {
    'type': 'research',
    'category': 'web_scraping',
    'source': 'internet_research',
    'payload': {
        'query': 'microkernel architecture best practices',
        'sources_found': 15,
        'content_hash': 'sha256:abc123...',
        'relevance_score': 8.7,
        'cached_urls': ['https://...', 'https://...'],
        'extraction_summary': 'Key findings on microkernel design...'
    },
    'actor': {'system': 'research_engine', 'version': '1.0'}
}

# Code project entry
project_entry = {
    'type': 'project',
    'category': 'code_generation',
    'source': 'learning_vi',
    'payload': {
        'project_name': 'microkernel_os',
        'phase': 'kernel_bootstrap',
        'files_generated': ['boot.asm', 'kernel.c', 'memory.h'],
        'lines_of_code': 847,
        'compilation_status': 'success',
        'test_results': {'passed': 12, 'failed': 0}
    },
    'actor': {'user_id': 'user_001', 'ai_model': 'codellama-70b'}
}
```

**Benefits of PulseLedger for Learning VI:**
- **Immutable Learning History**: Complete audit trail of AI interactions
- **Domain-Specific Organization**: Separate ledgers for different VI functions
- **Efficient Storage**: Built-in compression and retention policies
- **Cross-Domain Analytics**: Query patterns across conversation, research, and code
- **Automatic Deduplication**: Hash-chained entries prevent duplicate storage
- **Scalable Architecture**: Designed for business-scale operations
- **Audit Compliance**: Built-in integrity and access controls

### 5. Intelligent Question System
- Context-aware clarification requests
- Progressive information gathering
- Requirement specification templates
- Ambiguity detection and resolution
- Multi-turn conversation planning

## Advanced Features

### 6. Workstation Integration
- Full filesystem access with safety constraints
- Code execution in sandboxed environments
- Development environment setup and management
- Package manager integration (npm, pip, cargo, etc.)
- Git repository management and version control
- Build system automation (make, cmake, docker)

### 7. Project Management Capabilities
```yaml
# Example project structure
project_type: "operating_system"
phases:
  - requirements_analysis
  - architecture_design
  - kernel_development
  - driver_implementation
  - testing_validation
auto_execution: true
safety_checks: enabled
```

- Multi-phase project planning and execution
- Dependency tracking and management
- Progress monitoring and reporting
- Risk assessment and mitigation
- Quality assurance and testing automation

### 8. Remote/Local Deployment
- Client-server architecture with API endpoints
- Secure authentication and authorization
- Network synchronization between locations
- Offline mode with local model fallbacks
- Mobile companion app support

### Learning VI + PulseLedger Integration Architecture

**Custom Learning VI Ledger Classes**
```python
from pulse_ledgers import BaseLedger, LedgerConfiguration, LedgerAccessLevel

class LearningVIConversationLedger(BaseLedger):
    def _validate_entry(self, entry_data):
        required = ['user_query', 'model_selected', 'response_quality']
        return all(field in entry_data.get('payload', {}) for field in required)
    
    def _process_specialized_entry(self, entry):
        # Add conversation analytics
        payload = entry.payload
        payload['conversation_id'] = self._generate_conversation_id(entry)
        payload['quality_tier'] = 'high' if payload.get('response_quality', 0) > 8.0 else 'standard'
        return entry
    
    def get_conversation_analytics(self):
        """AI-specific analytics for conversation patterns"""
        return {
            'avg_response_quality': self._calculate_avg_quality(),
            'model_performance': self._analyze_model_performance(),
            'user_satisfaction_trends': self._track_satisfaction()
        }

class LearningVIResearchLedger(BaseLedger):
    def _validate_entry(self, entry_data):
        required = ['query', 'sources_found', 'content_hash']
        return all(field in entry_data.get('payload', {}) for field in required)
    
    def _process_specialized_entry(self, entry):
        # Add research-specific processing
        payload = entry.payload
        payload['research_id'] = self._generate_research_id(entry)
        payload['cache_efficiency'] = self._calculate_cache_hit_ratio()
        return entry
    
    def get_research_insights(self):
        """Research-specific analytics"""
        return {
            'cache_hit_ratio': self._calculate_cache_efficiency(),
            'top_research_domains': self._identify_research_patterns(),
            'source_reliability_scores': self._analyze_source_quality()
        }

class LearningVIProjectLedger(BaseLedger):
    def _validate_entry(self, entry_data):
        required = ['project_name', 'phase', 'files_generated']
        return all(field in entry_data.get('payload', {}) for field in required)
    
    def _process_specialized_entry(self, entry):
        # Add project management processing
        payload = entry.payload
        payload['project_complexity'] = self._assess_complexity(payload)
        payload['success_probability'] = self._predict_success(payload)
        return entry
    
    def get_project_intelligence(self):
        """Project-specific analytics for Learning VI"""
        return {
            'project_success_rates': self._analyze_completion_rates(),
            'complexity_trends': self._track_project_complexity(),
            'ai_model_effectiveness': self._evaluate_model_performance()
        }
```

**Learning VI Ledger Coordinator Integration**
```python
from pulse_ledgers.ledgers_coordinator import PulseLedgersCoordinator, LedgerTaskPriority

class LearningVILedgerManager:
    def __init__(self, storage_path="/data/learning_vi_ledgers"):
        self.coordinator = PulseLedgersCoordinator(storage_path)
        self.initialize_learning_vi_ledgers()
    
    def initialize_learning_vi_ledgers(self):
        """Set up all Learning VI specific ledgers"""
        
        # Register custom ledger types for Learning VI
        self.ledger_types = {
            'CONVERSATIONS': 'learning_vi_conversations',
            'RESEARCH': 'learning_vi_research', 
            'PROJECTS': 'learning_vi_projects',
            'MODEL_ANALYTICS': 'learning_vi_models',
            'USER_INTELLIGENCE': 'learning_vi_users'
        }
        
        # Initialize with domain-specific configs
        for ledger_name, ledger_type in self.ledger_types.items():
            config = self._get_learning_vi_config(ledger_name)
            self.coordinator.initialize_custom_ledger(
                domain="learning_vi",
                ledger_name=ledger_type,
                config=config
            )
    
    def log_conversation(self, user_query, model_response, metadata):
        """Log conversation with high priority for real-time analytics"""
        entry_data = {
            'type': 'conversation',
            'category': 'user_interaction',
            'payload': {
                'user_query': user_query,
                'model_response_summary': model_response[:500],  # Truncate for storage
                'model_selected': metadata.get('model'),
                'response_time': metadata.get('response_time'),
                'token_count': metadata.get('tokens'),
                'quality_score': metadata.get('quality', 0)
            },
            'actor': metadata.get('user_context', {})
        }
        
        return self.coordinator.submit_entry(
            'learning_vi_conversations',
            entry_data,
            priority=LedgerTaskPriority.HIGH
        )
    
    def log_research_activity(self, research_query, results, sources):
        """Log research with deduplication for efficiency"""
        entry_data = {
            'type': 'research',
            'category': 'knowledge_acquisition',
            'payload': {
                'research_query': research_query,
                'sources_processed': len(sources),
                'results_summary': results.get('summary', ''),
                'cache_hit': results.get('from_cache', False),
                'source_urls': sources[:10],  # Limit storage
                'content_hash': results.get('content_hash')
            },
            'actor': {'system': 'research_engine'}
        }
        
        return self.coordinator.submit_entry(
            'learning_vi_research',
            entry_data,
            priority=LedgerTaskPriority.MEDIUM
        )
    
    def log_project_progress(self, project_data):
        """Log project development with cross-domain tracking"""
        entry_data = {
            'type': 'project_progress',
            'category': 'development',
            'payload': project_data,
            'actor': {'system': 'learning_vi', 'user': project_data.get('user_id')}
        }
        
        # Submit to both project ledger and research (for cross-reference)
        return self.coordinator.submit_cross_domain_entry(
            entry_data,
            ['learning_vi_projects', 'learning_vi_research'],
            priority=LedgerTaskPriority.HIGH
        )
    
    def get_learning_vi_analytics(self):
        """Get comprehensive Learning VI analytics across all ledgers"""
        
        query_params = {
            'timestamp': {'gte': time.time() - 86400}  # Last 24 hours
        }
        
        task_id = self.coordinator.query_ledgers(
            query_params=query_params,
            ledger_types=list(self.ledger_types.values()),
            priority=LedgerTaskPriority.MEDIUM
        )
        
        # Return task ID for async result retrieval
        return task_id
```

### Frontend Components
1. **React/Vue.js** based chat interface
2. **WebSocket** connections for real-time updates
3. **Monaco Editor** integration for code editing
4. **Markdown renderer** with syntax highlighting
5. **File upload/download** with drag-and-drop support

### Security & Safety
- Sandboxed code execution environments
- Permission-based system access controls
- Input validation and sanitization
- Audit logging for all system interactions
- Emergency stop mechanisms for runaway processes

## Example Use Cases to Support

### 1. Operating System Development
```
User: "Learn everything about building a modern microkernel OS"
VI Response: 
- Research current microkernel architectures
- Create development roadmap
- Set up cross-compilation toolchain
- Generate kernel bootstrap code
- Implement memory management
- Build driver framework
```

### 2. Website Conversion
```
User: "Take website X and convert it to React with TypeScript"
VI Process:
- Analyze existing website structure
- Extract design patterns and components
- Generate TypeScript interfaces
- Create React component hierarchy
- Implement responsive design
- Set up build pipeline
```

### 3. Framework Integration
```
User: "Combine FastAPI, React, and PostgreSQL into a full-stack app"
VI Actions:
- Design database schema
- Create FastAPI backend with authentication
- Build React frontend with state management
- Implement API integration layer
- Set up development and production environments
```

## Implementation Priority
1. Core chat interface and model routing
2. Basic research and storage capabilities  
3. Workstation integration and safety systems
4. Advanced project management features
5. Remote deployment and synchronization

## Code Structure Recommendations
```
learning-vi/
├── frontend/          # React/Vue chat interface
├── backend/           # API services and model orchestration  
├── models/            # AI model wrappers and configs
├── research/          # Web scraping and knowledge extraction
├── execution/         # Sandboxed code execution environment
├── storage/           # NAS integration and data management
├── security/          # Authentication and safety systems
└── deployment/        # Docker configs and deployment scripts
```

Please generate a comprehensive codebase structure with detailed implementation for each component, focusing on modularity, scalability, and safety.