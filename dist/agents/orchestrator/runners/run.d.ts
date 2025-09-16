/**
 * Midori Orchestrator Core Runner v3.0
 * Enhanced with LLM Adapter integration and real AI processing
 * Focused on Chat AI Response for user interaction
 */
import { z } from 'zod';
declare enum CommandType {
    SELECT_TEMPLATE = "select_template",
    CUSTOMIZE_TEMPLATE = "customize_template",
    CREATE_COMPONENT = "create_component",
    UPDATE_COMPONENT = "update_component",
    CREATE_PAGE = "create_page",
    UPDATE_STYLING = "update_styling",
    PERFORMANCE_AUDIT = "performance_audit",
    ACCESSIBILITY_CHECK = "accessibility_check",
    RESPONSIVE_DESIGN = "responsive_design",
    CREATE_API_ENDPOINT = "create_api_endpoint",
    UPDATE_DATABASE_SCHEMA = "update_database_schema",
    CREATE_AUTH_SYSTEM = "create_auth_system",
    OPTIMIZE_DATABASE_QUERIES = "optimize_database_queries",
    IMPLEMENT_BUSINESS_LOGIC = "implement_business_logic",
    DATA_VALIDATION = "data_validation",
    SETUP_CICD = "setup_cicd",
    DEPLOY_APPLICATION = "deploy_application",
    SETUP_MONITORING = "setup_monitoring",
    OPTIMIZE_INFRASTRUCTURE = "optimize_infrastructure",
    SECURITY_SCAN = "security_scan",
    BACKUP_RESTORE = "backup_restore",
    CREATE_COMPLETE_WEBSITE = "create_complete_website",
    IMPLEMENT_FULL_FEATURE = "implement_full_feature",
    SETUP_FULL_STACK = "setup_full_stack"
}
declare enum TaskType {
    FRONTEND = "frontend",
    BACKEND = "backend",
    DEVOPS = "devops"
}
declare const CommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    commandType: z.ZodNativeEnum<typeof CommandType>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    metadata: z.ZodOptional<z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        userId?: string;
        projectId?: string;
    }, {
        timestamp?: string;
        userId?: string;
        projectId?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    priority?: "high" | "low" | "medium" | "critical";
    metadata?: {
        timestamp?: string;
        userId?: string;
        projectId?: string;
    };
    commandId?: string;
    commandType?: CommandType;
    payload?: Record<string, any>;
}, {
    priority?: "high" | "low" | "medium" | "critical";
    metadata?: {
        timestamp?: string;
        userId?: string;
        projectId?: string;
    };
    commandId?: string;
    commandType?: CommandType;
    payload?: Record<string, any>;
}>;
declare const TaskSchema: z.ZodEffects<z.ZodObject<{
    taskId: z.ZodString;
    agent: z.ZodNativeEnum<typeof TaskType>;
    action: z.ZodString;
    description: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    customDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deploymentGroup: z.ZodOptional<z.ZodString>;
    estimatedDuration: z.ZodNumber;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    status: z.ZodDefault<z.ZodEnum<["pending", "running", "completed", "failed"]>>;
    resourceRequirements: z.ZodDefault<z.ZodObject<{
        cpu: z.ZodDefault<z.ZodNumber>;
        memory: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        cpu?: number;
        memory?: number;
    }, {
        cpu?: number;
        memory?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    dependencies?: string[];
    priority?: "high" | "low" | "medium" | "critical";
    action?: string;
    description?: string;
    status?: "failed" | "completed" | "running" | "pending";
    agent?: TaskType;
    payload?: Record<string, any>;
    taskId?: string;
    customDependencies?: string[];
    deploymentGroup?: string;
    estimatedDuration?: number;
    resourceRequirements?: {
        cpu?: number;
        memory?: number;
    };
}, {
    dependencies?: string[];
    priority?: "high" | "low" | "medium" | "critical";
    action?: string;
    description?: string;
    status?: "failed" | "completed" | "running" | "pending";
    agent?: TaskType;
    payload?: Record<string, any>;
    taskId?: string;
    customDependencies?: string[];
    deploymentGroup?: string;
    estimatedDuration?: number;
    resourceRequirements?: {
        cpu?: number;
        memory?: number;
    };
}>, {
    status: "failed" | "completed" | "running" | "pending";
    dependencies?: string[];
    priority?: "high" | "low" | "medium" | "critical";
    action?: string;
    description?: string;
    agent?: TaskType;
    payload?: Record<string, any>;
    taskId?: string;
    customDependencies?: string[];
    deploymentGroup?: string;
    estimatedDuration?: number;
    resourceRequirements?: {
        cpu?: number;
        memory?: number;
    };
}, {
    dependencies?: string[];
    priority?: "high" | "low" | "medium" | "critical";
    action?: string;
    description?: string;
    status?: "failed" | "completed" | "running" | "pending";
    agent?: TaskType;
    payload?: Record<string, any>;
    taskId?: string;
    customDependencies?: string[];
    deploymentGroup?: string;
    estimatedDuration?: number;
    resourceRequirements?: {
        cpu?: number;
        memory?: number;
    };
}>;
declare const ExecutionStageSchema: z.ZodObject<{
    stageId: z.ZodString;
    parallelTasks: z.ZodArray<z.ZodString, "many">;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    estimatedDuration: z.ZodNumber;
    resourceRequirements: z.ZodObject<{
        maxCpu: z.ZodNumber;
        maxMemory: z.ZodNumber;
        maxConcurrency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        maxCpu?: number;
        maxMemory?: number;
        maxConcurrency?: number;
    }, {
        maxCpu?: number;
        maxMemory?: number;
        maxConcurrency?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    dependencies?: string[];
    estimatedDuration?: number;
    resourceRequirements?: {
        maxCpu?: number;
        maxMemory?: number;
        maxConcurrency?: number;
    };
    stageId?: string;
    parallelTasks?: string[];
}, {
    dependencies?: string[];
    estimatedDuration?: number;
    resourceRequirements?: {
        maxCpu?: number;
        maxMemory?: number;
        maxConcurrency?: number;
    };
    stageId?: string;
    parallelTasks?: string[];
}>;
declare const ExecutionPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    commandId: z.ZodString;
    tasks: z.ZodArray<z.ZodEffects<z.ZodObject<{
        taskId: z.ZodString;
        agent: z.ZodNativeEnum<typeof TaskType>;
        action: z.ZodString;
        description: z.ZodString;
        payload: z.ZodRecord<z.ZodString, z.ZodAny>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        customDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        deploymentGroup: z.ZodOptional<z.ZodString>;
        estimatedDuration: z.ZodNumber;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        status: z.ZodDefault<z.ZodEnum<["pending", "running", "completed", "failed"]>>;
        resourceRequirements: z.ZodDefault<z.ZodObject<{
            cpu: z.ZodDefault<z.ZodNumber>;
            memory: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cpu?: number;
            memory?: number;
        }, {
            cpu?: number;
            memory?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        status?: "failed" | "completed" | "running" | "pending";
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }, {
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        status?: "failed" | "completed" | "running" | "pending";
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }>, {
        status: "failed" | "completed" | "running" | "pending";
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }, {
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        status?: "failed" | "completed" | "running" | "pending";
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }>, "many">;
    executionStages: z.ZodArray<z.ZodObject<{
        stageId: z.ZodString;
        parallelTasks: z.ZodArray<z.ZodString, "many">;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        estimatedDuration: z.ZodNumber;
        resourceRequirements: z.ZodObject<{
            maxCpu: z.ZodNumber;
            maxMemory: z.ZodNumber;
            maxConcurrency: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        }, {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        dependencies?: string[];
        estimatedDuration?: number;
        resourceRequirements?: {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        };
        stageId?: string;
        parallelTasks?: string[];
    }, {
        dependencies?: string[];
        estimatedDuration?: number;
        resourceRequirements?: {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        };
        stageId?: string;
        parallelTasks?: string[];
    }>, "many">;
    qualityGates: z.ZodArray<z.ZodObject<{
        gate: z.ZodString;
        required: z.ZodBoolean;
        trigger: z.ZodEnum<["before_start", "before_deploy", "after_completion"]>;
        checks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        thresholds: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        required?: boolean;
        checks?: string[];
        gate?: string;
        trigger?: "before_start" | "before_deploy" | "after_completion";
        thresholds?: Record<string, number>;
    }, {
        required?: boolean;
        checks?: string[];
        gate?: string;
        trigger?: "before_start" | "before_deploy" | "after_completion";
        thresholds?: Record<string, number>;
    }>, "many">;
    estimatedTotalDuration: z.ZodNumber;
    totalResourceRequirements: z.ZodObject<{
        maxParallelTasks: z.ZodNumber;
        totalCpuUnits: z.ZodNumber;
        totalMemoryUnits: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        maxParallelTasks?: number;
        totalCpuUnits?: number;
        totalMemoryUnits?: number;
    }, {
        maxParallelTasks?: number;
        totalCpuUnits?: number;
        totalMemoryUnits?: number;
    }>;
    metadata: z.ZodObject<{
        createdAt: z.ZodString;
        complexity: z.ZodOptional<z.ZodEnum<["simple", "medium", "complex"]>>;
        requiredAgents: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof TaskType>, "many">>;
        aiGenerated: z.ZodOptional<z.ZodBoolean>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string;
        createdAt?: string;
        complexity?: "medium" | "simple" | "complex";
        requiredAgents?: TaskType[];
        aiGenerated?: boolean;
    }, {
        model?: string;
        createdAt?: string;
        complexity?: "medium" | "simple" | "complex";
        requiredAgents?: TaskType[];
        aiGenerated?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        model?: string;
        createdAt?: string;
        complexity?: "medium" | "simple" | "complex";
        requiredAgents?: TaskType[];
        aiGenerated?: boolean;
    };
    tasks?: {
        status: "failed" | "completed" | "running" | "pending";
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }[];
    commandId?: string;
    planId?: string;
    executionStages?: {
        dependencies?: string[];
        estimatedDuration?: number;
        resourceRequirements?: {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        };
        stageId?: string;
        parallelTasks?: string[];
    }[];
    qualityGates?: {
        required?: boolean;
        checks?: string[];
        gate?: string;
        trigger?: "before_start" | "before_deploy" | "after_completion";
        thresholds?: Record<string, number>;
    }[];
    estimatedTotalDuration?: number;
    totalResourceRequirements?: {
        maxParallelTasks?: number;
        totalCpuUnits?: number;
        totalMemoryUnits?: number;
    };
}, {
    metadata?: {
        model?: string;
        createdAt?: string;
        complexity?: "medium" | "simple" | "complex";
        requiredAgents?: TaskType[];
        aiGenerated?: boolean;
    };
    tasks?: {
        dependencies?: string[];
        priority?: "high" | "low" | "medium" | "critical";
        action?: string;
        description?: string;
        status?: "failed" | "completed" | "running" | "pending";
        agent?: TaskType;
        payload?: Record<string, any>;
        taskId?: string;
        customDependencies?: string[];
        deploymentGroup?: string;
        estimatedDuration?: number;
        resourceRequirements?: {
            cpu?: number;
            memory?: number;
        };
    }[];
    commandId?: string;
    planId?: string;
    executionStages?: {
        dependencies?: string[];
        estimatedDuration?: number;
        resourceRequirements?: {
            maxCpu?: number;
            maxMemory?: number;
            maxConcurrency?: number;
        };
        stageId?: string;
        parallelTasks?: string[];
    }[];
    qualityGates?: {
        required?: boolean;
        checks?: string[];
        gate?: string;
        trigger?: "before_start" | "before_deploy" | "after_completion";
        thresholds?: Record<string, number>;
    }[];
    estimatedTotalDuration?: number;
    totalResourceRequirements?: {
        maxParallelTasks?: number;
        totalCpuUnits?: number;
        totalMemoryUnits?: number;
    };
}>;
declare const OrchestratorResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    plan: z.ZodOptional<z.ZodObject<{
        planId: z.ZodString;
        commandId: z.ZodString;
        tasks: z.ZodArray<z.ZodEffects<z.ZodObject<{
            taskId: z.ZodString;
            agent: z.ZodNativeEnum<typeof TaskType>;
            action: z.ZodString;
            description: z.ZodString;
            payload: z.ZodRecord<z.ZodString, z.ZodAny>;
            dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            customDependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            deploymentGroup: z.ZodOptional<z.ZodString>;
            estimatedDuration: z.ZodNumber;
            priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
            status: z.ZodDefault<z.ZodEnum<["pending", "running", "completed", "failed"]>>;
            resourceRequirements: z.ZodDefault<z.ZodObject<{
                cpu: z.ZodDefault<z.ZodNumber>;
                memory: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cpu?: number;
                memory?: number;
            }, {
                cpu?: number;
                memory?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            status?: "failed" | "completed" | "running" | "pending";
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }, {
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            status?: "failed" | "completed" | "running" | "pending";
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }>, {
            status: "failed" | "completed" | "running" | "pending";
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }, {
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            status?: "failed" | "completed" | "running" | "pending";
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }>, "many">;
        executionStages: z.ZodArray<z.ZodObject<{
            stageId: z.ZodString;
            parallelTasks: z.ZodArray<z.ZodString, "many">;
            dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            estimatedDuration: z.ZodNumber;
            resourceRequirements: z.ZodObject<{
                maxCpu: z.ZodNumber;
                maxMemory: z.ZodNumber;
                maxConcurrency: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            }, {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }, {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }>, "many">;
        qualityGates: z.ZodArray<z.ZodObject<{
            gate: z.ZodString;
            required: z.ZodBoolean;
            trigger: z.ZodEnum<["before_start", "before_deploy", "after_completion"]>;
            checks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            thresholds: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }, {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }>, "many">;
        estimatedTotalDuration: z.ZodNumber;
        totalResourceRequirements: z.ZodObject<{
            maxParallelTasks: z.ZodNumber;
            totalCpuUnits: z.ZodNumber;
            totalMemoryUnits: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        }, {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        }>;
        metadata: z.ZodObject<{
            createdAt: z.ZodString;
            complexity: z.ZodOptional<z.ZodEnum<["simple", "medium", "complex"]>>;
            requiredAgents: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof TaskType>, "many">>;
            aiGenerated: z.ZodOptional<z.ZodBoolean>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        }, {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        metadata?: {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        };
        tasks?: {
            status: "failed" | "completed" | "running" | "pending";
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }[];
        commandId?: string;
        planId?: string;
        executionStages?: {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }[];
        qualityGates?: {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }[];
        estimatedTotalDuration?: number;
        totalResourceRequirements?: {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        };
    }, {
        metadata?: {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        };
        tasks?: {
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            status?: "failed" | "completed" | "running" | "pending";
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }[];
        commandId?: string;
        planId?: string;
        executionStages?: {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }[];
        qualityGates?: {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }[];
        estimatedTotalDuration?: number;
        totalResourceRequirements?: {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        };
    }>>;
    error: z.ZodOptional<z.ZodString>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    chatResponse: z.ZodOptional<z.ZodObject<{
        message: z.ZodString;
        tone: z.ZodString;
        suggestions: z.ZodArray<z.ZodString, "many">;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        tone?: string;
        timestamp?: string;
        suggestions?: string[];
    }, {
        message?: string;
        tone?: string;
        timestamp?: string;
        suggestions?: string[];
    }>>;
    metadata: z.ZodObject<{
        processingTimeMs: z.ZodNumber;
        validationErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        processingTimeMs?: number;
        validationErrors?: string[];
    }, {
        processingTimeMs?: number;
        validationErrors?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    metadata?: {
        processingTimeMs?: number;
        validationErrors?: string[];
    };
    success?: boolean;
    plan?: {
        metadata?: {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        };
        tasks?: {
            status: "failed" | "completed" | "running" | "pending";
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }[];
        commandId?: string;
        planId?: string;
        executionStages?: {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }[];
        qualityGates?: {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }[];
        estimatedTotalDuration?: number;
        totalResourceRequirements?: {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        };
    };
    warnings?: string[];
    chatResponse?: {
        message?: string;
        tone?: string;
        timestamp?: string;
        suggestions?: string[];
    };
}, {
    error?: string;
    metadata?: {
        processingTimeMs?: number;
        validationErrors?: string[];
    };
    success?: boolean;
    plan?: {
        metadata?: {
            model?: string;
            createdAt?: string;
            complexity?: "medium" | "simple" | "complex";
            requiredAgents?: TaskType[];
            aiGenerated?: boolean;
        };
        tasks?: {
            dependencies?: string[];
            priority?: "high" | "low" | "medium" | "critical";
            action?: string;
            description?: string;
            status?: "failed" | "completed" | "running" | "pending";
            agent?: TaskType;
            payload?: Record<string, any>;
            taskId?: string;
            customDependencies?: string[];
            deploymentGroup?: string;
            estimatedDuration?: number;
            resourceRequirements?: {
                cpu?: number;
                memory?: number;
            };
        }[];
        commandId?: string;
        planId?: string;
        executionStages?: {
            dependencies?: string[];
            estimatedDuration?: number;
            resourceRequirements?: {
                maxCpu?: number;
                maxMemory?: number;
                maxConcurrency?: number;
            };
            stageId?: string;
            parallelTasks?: string[];
        }[];
        qualityGates?: {
            required?: boolean;
            checks?: string[];
            gate?: string;
            trigger?: "before_start" | "before_deploy" | "after_completion";
            thresholds?: Record<string, number>;
        }[];
        estimatedTotalDuration?: number;
        totalResourceRequirements?: {
            maxParallelTasks?: number;
            totalCpuUnits?: number;
            totalMemoryUnits?: number;
        };
    };
    warnings?: string[];
    chatResponse?: {
        message?: string;
        tone?: string;
        timestamp?: string;
        suggestions?: string[];
    };
}>;
type Command = z.infer<typeof CommandSchema>;
type Task = z.infer<typeof TaskSchema>;
type ExecutionStage = z.infer<typeof ExecutionStageSchema>;
type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;
export declare function run(rawCommand: unknown): Promise<OrchestratorResult>;
export { CommandType, TaskType };
export type { Command, Task, ExecutionStage, ExecutionPlan, OrchestratorResult };
