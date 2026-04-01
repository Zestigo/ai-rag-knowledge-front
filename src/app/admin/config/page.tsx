'use client';

import React, { useState, useEffect } from 'react';
import { adminService, GatewayConfigDTO, GatewayToolConfigDTO, GatewayProtocolDTO, GatewayAuthDTO, GatewayConfigRequest, GatewayToolConfigRequest, GatewayProtocolRequest, GatewayAuthRequest } from '@/api/adminService';

interface ConfigFormState {
  type: 'basic' | 'tool' | 'protocol' | 'auth';
  formData: GatewayConfigRequest | GatewayToolConfigRequest | GatewayProtocolRequest | GatewayAuthRequest;
}

export default function ConfigPage() {
  const [configList, setConfigList] = useState<GatewayConfigDTO[]>([]);
  const [toolConfigList, setToolConfigList] = useState<GatewayToolConfigDTO[]>([]);
  const [protocolConfigList, setProtocolConfigList] = useState<GatewayProtocolDTO[]>([]);
  const [authConfigList, setAuthConfigList] = useState<GatewayAuthDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  // 显示API Key的状态
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<ConfigFormState>({
    type: 'basic',
    formData: {
      gatewayId: '',
      gatewayName: '',
      gatewayDesc: '',
      version: '1.0.0',
      auth: 1,
      status: 1
    }
  });
  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete'>('edit');
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  // 编辑表单状态
  const [editFormState, setEditFormState] = useState<ConfigFormState>({
    type: 'basic',
    formData: {
      gatewayId: '',
      gatewayName: '',
      gatewayDesc: '',
      version: '1.0.0',
      auth: 1,
      status: 1
    }
  });
  // GatewayId选择状态
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  // 网关列表
  const [gatewayList, setGatewayList] = useState<GatewayConfigDTO[]>([]);

  // 加载网关列表
  const loadGatewayList = async () => {
    try {
      // 传递更大的pageSize以获取更多网关
      const response = await adminService.queryGatewayList(undefined, undefined, 1, 100);
      if (response.code === '0000' && response.data) {
        setGatewayList(response.data.list || []);
      }
    } catch (err) {
      console.error('加载网关列表失败:', err);
    }
  };

  // 加载配置列表
  useEffect(() => {
    const loadConfigs = async () => {
      switch (formState.type) {
        case 'basic':
          await loadConfigList();
          break;
        case 'tool':
          await loadToolConfigList();
          break;
        case 'protocol':
          await loadProtocolConfigList();
          break;
        case 'auth':
          await loadAuthConfigList();
          break;
      }
    };
    loadConfigs();
  }, [formState.type, currentPage, pageSize, selectedGatewayId]);

  // 组件加载时加载网关列表
  useEffect(() => {
    loadGatewayList();
  }, []);

  const loadConfigList = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('开始查询网关配置列表');
      const response = await adminService.queryGatewayList(undefined, undefined, currentPage, pageSize);
      console.log('查询网关配置列表响应:', response);
      // 检查响应结构，使用后端实际的响应格式
      if (response.code === '0000' && response.data) {
        console.log('查询成功，数据:', response.data);
        // 从分页响应中提取列表数据和分页信息
        const data = response.data.list || [];
        setConfigList(data);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.pageNo || 1);
        setPageSize(response.data.pageSize || 10);
      } else {
        console.log('查询失败，消息:', response.info || '未知错误');
        setError(response.info || '查询失败');
      }
    } catch (err) {
      console.error('查询网关配置列表错误:', err);
      setError('加载配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadToolConfigList = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('开始查询网关工具配置列表，gatewayId:', selectedGatewayId);
      // 当gatewayId为空时，传空字符串给后端以显示全部
      const response = await adminService.queryToolList(selectedGatewayId || '', undefined, undefined, currentPage, pageSize);
      console.log('查询网关工具配置列表响应:', response);
      // 检查响应结构，使用后端实际的响应格式
      if (response.code === '0000' && response.data) {
        console.log('查询成功，数据:', response.data);
        // 从分页响应中提取列表数据和分页信息
        const data = response.data.list || [];
        setToolConfigList(data);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.pageNo || 1);
        setPageSize(response.data.pageSize || 10);
      } else {
        console.log('查询失败，消息:', response.info || '未知错误');
        setError(response.info || '查询失败');
      }
    } catch (err) {
      console.error('查询网关工具配置列表错误:', err);
      setError('加载工具配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProtocolConfigList = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('开始查询网关协议配置列表');
      const response = await adminService.queryProtocolList(undefined, undefined, currentPage, pageSize);
      console.log('查询网关协议配置列表响应:', response);
      // 检查响应结构，使用后端实际的响应格式
      if (response.code === '0000' && response.data) {
        console.log('查询成功，数据:', response.data);
        // 从分页响应中提取列表数据和分页信息
        const data = response.data.list || [];
        setProtocolConfigList(data);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.pageNo || 1);
        setPageSize(response.data.pageSize || 10);
      } else {
        console.log('查询失败，消息:', response.info || '未知错误');
        setError(response.info || '查询失败');
      }
    } catch (err) {
      console.error('查询网关协议配置列表错误:', err);
      setError('加载协议配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthConfigList = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('开始查询网关认证配置列表，gatewayId:', selectedGatewayId);
      // 当gatewayId为空时，传空字符串给后端以显示全部
      const response = await adminService.queryApiKeyList(selectedGatewayId || '', currentPage, pageSize);
      console.log('查询网关认证配置列表响应:', response);
      // 检查响应结构，使用后端实际的响应格式
      if (response.code === '0000' && response.data) {
        console.log('查询成功，数据:', response.data);
        // 从分页响应中提取列表数据和分页信息
        const data = response.data.list || [];
        setAuthConfigList(data);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.pageNo || 1);
        setPageSize(response.data.pageSize || 10);
      } else {
        console.log('查询失败，消息:', response.info || '未知错误');
        setError(response.info || '查询失败');
      }
    } catch (err) {
      console.error('查询网关认证配置列表错误:', err);
      setError('加载认证配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑配置
  const handleEdit = (config: any) => {
    setCurrentConfig(config);
    setDialogType('edit');
    setDialogOpen(true);
    // 根据配置数据判断类型并设置正确的editFormState.type
    let configType: 'basic' | 'tool' | 'protocol' | 'auth' = 'basic';
    
    // 根据配置数据的属性判断类型
    if (config.gatewayId && config.gatewayName && config.auth !== undefined) {
      configType = 'basic';
    } else if (config.gatewayId && config.toolId && config.toolName) {
      configType = 'tool';
    } else if (config.protocolId && config.httpUrl && config.httpMethod) {
      configType = 'protocol';
    } else if (config.gatewayId && config.apiKey && config.rateLimit) {
      configType = 'auth';
    }
    
    let formData = { ...config };
    
    // 对于工具配置，将后端返回的toolStatus字段转换为前端期望的status字段
    if (configType === 'tool') {
      formData = {
        ...formData,
        status: config.toolStatus !== undefined ? config.toolStatus : formData.status,
        toolStatus: undefined
      };
    }
    
    // 同时更新编辑表单数据，以便在对话框中显示
    setEditFormState({
      type: configType,
      formData
    });
  };

  // 打开删除对话框
  const handleDeleteClick = (config: any) => {
    setCurrentConfig(config);
    setDialogType('delete');
    setDialogOpen(true);
  };

  // 执行删除操作
  const handleDelete = async () => {
    if (!currentConfig) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      // 根据currentConfig的属性判断配置类型
      if (currentConfig.gatewayId && currentConfig.gatewayName && currentConfig.auth !== undefined) {
        // 基础配置
        response = await adminService.deleteGateway(currentConfig.gatewayId);
      } else if (currentConfig.gatewayId && currentConfig.toolId && currentConfig.toolName) {
        // 工具配置
        response = await adminService.unbindTool(currentConfig.gatewayId, currentConfig.toolId, currentConfig.protocolId);
      } else if (currentConfig.protocolId && currentConfig.httpUrl && currentConfig.httpMethod) {
        // 协议配置
        response = await adminService.deleteProtocol(currentConfig.id);
      } else if (currentConfig.gatewayId && currentConfig.apiKey && currentConfig.rateLimit) {
        // 认证配置
        response = await adminService.revokeApiKey(currentConfig.gatewayId, currentConfig.apiKey);
      } else {
        throw new Error('未知的配置类型');
      }
      
      console.log('删除配置响应:', response);
      if (response && response.code === '0000') {
        console.log('删除成功');
        // 重新加载当前配置类型的列表
        await loadConfigs();
        setSuccess('删除成功');
        setDialogOpen(false);
      } else {
        console.log('删除失败，消息:', response?.info || '未知错误');
        setError(response?.info || '删除失败');
      }
    } catch (err) {
      console.error('删除配置错误:', err);
      setError(err instanceof Error ? err.message : '删除配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 启用/禁用配置
  const handleToggleStatus = async (config: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      const newStatus = config.status === 1 ? 0 : 1;
      
      // 根据config的属性判断配置类型
      if (config.gatewayId && config.gatewayName && config.auth !== undefined) {
        // 基础配置
        response = newStatus === 1 
          ? await adminService.enableGateway(config.gatewayId, config.version || '1')
          : await adminService.disableGateway(config.gatewayId, config.version || '1');
      } else if (config.gatewayId && config.toolId && config.toolName) {
        // 工具配置
        response = newStatus === 1
          ? await adminService.enableTool(config.gatewayId, config.toolId, config.protocolId, config.version || '1')
          : await adminService.disableTool(config.gatewayId, config.toolId, config.protocolId, config.version || '1');
      } else if (config.protocolId && config.httpUrl && config.httpMethod) {
        // 协议配置
        response = await adminService.updateProtocolStatus(config.protocolId, newStatus, config.version || '1');
      } else if (config.gatewayId && config.apiKey && config.rateLimit) {
        // 认证配置
        response = newStatus === 1
          ? await adminService.enableApiKey(config.gatewayId, config.apiKey, config.version || '1')
          : await adminService.disableApiKey(config.gatewayId, config.apiKey, config.version || '1');
      } else {
        throw new Error('未知的配置类型');
      }
      
      console.log('切换状态响应:', response);
      if (response && response.code === '0000') {
        console.log('状态切换成功');
        // 重新加载当前配置类型的列表
        await loadConfigs();
        setSuccess('状态切换成功');
      } else {
        console.log('状态切换失败，消息:', response?.info || '未知错误');
        setError(response?.info || '状态切换失败');
      }
    } catch (err) {
      console.error('切换状态错误:', err);
      setError(err instanceof Error ? err.message : '状态切换失败');
    } finally {
      setLoading(false);
    }
  };

  // 重新加载配置列表
  const loadConfigs = async () => {
    switch (formState.type) {
      case 'basic':
        await loadConfigList();
        break;
      case 'tool':
        await loadToolConfigList();
        break;
      case 'protocol':
        await loadProtocolConfigList();
        break;
      case 'auth':
        await loadAuthConfigList();
        break;
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('开始保存配置，类型:', formState.type);
      console.log('保存配置数据:', formState.formData);
      let response;
      
      switch (formState.type) {
        case 'basic':
          // 判断是创建还是编辑
          if (currentConfig) {
            // 编辑操作：执行更新
            response = await adminService.updateGateway(formState.formData as GatewayConfigRequest, currentConfig.version || '1');
          } else {
            // 新建操作：执行创建
            response = await adminService.createGateway(formState.formData as GatewayConfigRequest);
          }
          break;
        case 'tool':
          // 判断是创建还是编辑
          if (currentConfig) {
            // 编辑操作：执行更新
            response = await adminService.updateToolConfig(formState.formData as GatewayToolConfigRequest, currentConfig.version || '1');
          } else {
            // 新建操作：执行绑定
            response = await adminService.bindTool(formState.formData as GatewayToolConfigRequest);
          }
          break;
        case 'protocol':
          // 验证协议配置格式
          try {
            JSON.parse(JSON.stringify(formState.formData));
          } catch {
            throw new Error('协议配置格式不正确');
          }
          // 判断是创建还是编辑
          if (currentConfig) {
            // 编辑操作：执行更新
            response = await adminService.updateProtocol(formState.formData as GatewayProtocolRequest, currentConfig.version || '1');
          } else {
            // 新建操作：执行创建
            response = await adminService.createProtocol(formState.formData as GatewayProtocolRequest);
          }
          break;
        case 'auth':
          // 判断是创建还是编辑
          if (currentConfig) {
            // 编辑操作：执行更新
            response = await adminService.updateApiKey(formState.formData as GatewayAuthRequest, currentConfig.version || '1');
          } else {
            // 新建操作：执行创建
            response = await adminService.createApiKey(formState.formData as GatewayAuthRequest);
          }
          break;
        default:
          throw new Error('未知的配置类型');
      }
      
      console.log('保存配置响应:', response);
      // 检查响应结构，使用后端实际的响应格式
      if (response && response.code === '0000') {
        console.log('保存成功');
        // 重新加载当前配置类型的列表
        await loadConfigs();
        // 重置表单
        resetForm();
        setSuccess('保存成功');
        // 如果是基础配置，重新加载网关列表
        if (formState.type === 'basic') {
          await loadGatewayList();
        }
      } else {
        console.log('保存失败，消息:', response?.info || '未知错误');
        setError(response?.info || '保存失败');
      }
    } catch (err) {
      console.error('保存配置错误:', err);
      setError(err instanceof Error ? err.message : '保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 表单验证
  const validateForm = () => {
    const formData = formState.formData as any;
    
    switch (formState.type) {
      case 'basic':
        if (!formData.gatewayId) {
          setError('网关ID不能为空');
          return false;
        }
        if (!formData.gatewayName) {
          setError('网关名称不能为空');
          return false;
        }
        break;
      case 'tool':
        if (!formData.gatewayId) {
          setError('网关ID不能为空');
          return false;
        }
        if (!formData.toolId) {
          setError('工具ID不能为空');
          return false;
        }
        if (!formData.toolName) {
          setError('工具名称不能为空');
          return false;
        }
        if (!formData.toolType) {
          setError('工具类型不能为空');
          return false;
        }
        if (!formData.toolDescription) {
          setError('工具描述不能为空');
          return false;
        }
        if (!formData.protocolId) {
          setError('协议ID不能为空');
          return false;
        }
        if (!formData.protocolType) {
          setError('协议类型不能为空');
          return false;
        }
        break;
      case 'protocol':
        if (!formData.protocolId) {
          setError('协议ID不能为空');
          return false;
        }
        if (!formData.httpUrl) {
          setError('HTTP URL不能为空');
          return false;
        }
        if (!formData.httpMethod) {
          setError('HTTP 方法不能为空');
          return false;
        }
        if (!formData.timeout) {
          setError('超时时间不能为空');
          return false;
        }
        break;
      case 'auth':
        if (!formData.gatewayId) {
          setError('网关ID不能为空');
          return false;
        }
        if (!formData.rateLimit) {
          setError('速率限制不能为空');
          return false;
        }
        if (!formData.expireTime) {
          setError('过期时间不能为空');
          return false;
        }
        break;
    }
    return true;
  };

  // 重置表单
  const resetForm = () => {
    // 重置currentConfig
    setCurrentConfig(null);
    
    switch (formState.type) {
      case 'basic':
        setFormState({
          type: 'basic',
          formData: {
            gatewayId: '',
            gatewayName: '',
            gatewayDesc: '',
            version: '1.0.0',
            auth: 1,
            status: 1
          }
        });
        break;
      case 'tool':
        setFormState({
          type: 'tool',
          formData: {
            gatewayId: '',
            toolId: 0,
            toolName: '',
            toolType: '',
            toolDescription: '',
            toolVersion: '1.0.0',
            protocolId: 0,
            protocolType: '',
            status: 1
          }
        });
        break;
      case 'protocol':
        setFormState({
          type: 'protocol',
          formData: {
            id: undefined,
            protocolId: 0,
            protocolType: 'HTTP',
            httpUrl: '',
            httpMethod: 'POST',
            timeout: 30000,
            httpHeaders: {},
            status: 1,
            mappings: [{
              mappingType: 'request',
              fieldName: '',
              mcpPath: '',
              mcpType: '',
              sortOrder: 1
            }]
          }
        });
        break;
      case 'auth':
        setFormState({
          type: 'auth',
          formData: {
            gatewayId: '',
            rateLimit: 100,
            expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 1
          }
        });
        break;
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  // 处理映射字段输入变化
  const handleMappingChange = (mappingIndex: number, field: string, value: string) => {
    setFormState(prev => {
      const updatedFormData = { ...prev.formData } as any;
      if (Array.isArray(updatedFormData.mappings) && mappingIndex >= 0 && mappingIndex < updatedFormData.mappings.length) {
        updatedFormData.mappings[mappingIndex] = {
          ...updatedFormData.mappings[mappingIndex],
          [field]: value
        };
      }
      return {
        ...prev,
        formData: updatedFormData
      };
    });
  };

  // 添加映射
  const addMapping = () => {
    setFormState(prev => {
      const updatedFormData = { ...prev.formData } as any;
      updatedFormData.mappings = [
        ...(updatedFormData.mappings || []),
        {
          mappingType: 'request',
          fieldName: '',
          mcpPath: '',
          mcpType: '',
          sortOrder: (updatedFormData.mappings?.length || 0) + 1
        }
      ];
      return {
        ...prev,
        formData: updatedFormData
      };
    });
  };

  // 切换表单类型
  const switchFormType = (type: 'basic' | 'tool' | 'protocol' | 'auth') => {
    setError(null);
    setSuccess(null);
    // 重置currentConfig
    setCurrentConfig(null);
    switch (type) {
      case 'basic':
        setFormState({
          type: 'basic',
          formData: {
            gatewayId: '',
            gatewayName: '',
            gatewayDesc: '',
            version: '1.0.0',
            auth: 1,
            status: 1
          }
        });
        break;
      case 'tool':
        setFormState({
          type: 'tool',
          formData: {
            gatewayId: '',
            toolId: 0,
            toolName: '',
            toolType: '',
            toolDescription: '',
            toolVersion: '1.0.0',
            protocolId: 0,
            protocolType: '',
            status: 1
          }
        });
        break;
      case 'protocol':
        setFormState({
          type: 'protocol',
          formData: {
            id: undefined,
            protocolId: 0,
            protocolType: 'HTTP',
            httpUrl: '',
            httpMethod: 'POST',
            timeout: 30000,
            httpHeaders: {},
            status: 1,
            mappings: [{
              mappingType: 'request',
              fieldName: '',
              mcpPath: '',
              mcpType: '',
              sortOrder: 1
            }]
          }
        });
        break;
      case 'auth':
        setFormState({
          type: 'auth',
          formData: {
            gatewayId: '',
            rateLimit: 100,
            expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 1
          }
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">网关配置管理</h2>
        <p className="text-foreground">管理网关的各种配置项</p>
      </div>

      {/* 悬浮式消息提示 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
          {success}
        </div>
      )}

      {/* 配置列表 */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {formState.type === 'basic' && '基础配置列表'}
          {formState.type === 'tool' && '工具配置列表'}
          {formState.type === 'protocol' && '协议配置列表'}
          {formState.type === 'auth' && '认证配置列表'}
        </h3>
        
        {/* 网关选择器 */}
        {(formState.type === 'tool' || formState.type === 'auth') && (
          <div className="mb-4">
            <label htmlFor="gatewayIdSelect" className="block text-sm font-medium text-foreground mb-2">
              选择网关
            </label>
            <select
              id="gatewayIdSelect"
              value={selectedGatewayId}
              onChange={(e) => setSelectedGatewayId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择网关</option>
              {gatewayList.map((gateway) => (
                <option key={gateway.gatewayId} value={gateway.gatewayId}>
                  {gateway.gatewayName} ({gateway.gatewayId})
                </option>
              ))}
            </select>
          </div>
        )}
        {loading ? (
          <div className="text-center py-4">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            {formState.type === 'basic' && (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[var(--bg-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      网关ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      网关名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      版本
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      认证状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      网关状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {configList.map((config) => (
                    <tr key={config.gatewayId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.gatewayId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.gatewayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.auth === 1 ? '已认证' : '未认证'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.status === 1 ? '在线' : '离线'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleToggleStatus(config)}
                            className={config.status === 1 ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'}
                          >
                            {config.status === 1 ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(config)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {formState.type === 'tool' && (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[var(--bg-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      网关ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      工具ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      工具名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      工具类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      协议ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      协议类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {toolConfigList.map((config) => (
                    <tr key={`${config.gatewayId}-${config.toolId}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.gatewayId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.toolId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.toolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.toolType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.protocolId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.protocolType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.status === 1 ? '启用' : '禁用'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleToggleStatus(config)}
                            className={config.status === 1 ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'}
                          >
                            {config.status === 1 ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(config)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {formState.type === 'protocol' && (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[var(--bg-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      序号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      协议ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      HTTP URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      HTTP 方法
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      超时时间 (ms)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      映射数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {protocolConfigList.map((config, index) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.protocolId}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {config.httpUrl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.httpMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.timeout}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.mappings?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {config.status === 1 ? '启用' : '禁用'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleToggleStatus(config)}
                            className={config.status === 1 ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'}
                          >
                            {config.status === 1 ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(config)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {formState.type === 'auth' && (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[var(--bg-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      网关ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      速率限制 (次/分钟)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      过期时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {authConfigList.map((config) => {
                    // 生成唯一键，使用gatewayId和apiKey的组合
                    const key = `${config.gatewayId}-${config.apiKey}`;
                    return (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {config.gatewayId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {showApiKey[key] ? (
                            <>
                              {config.apiKey}
                              <button
                                onClick={() => setShowApiKey(prev => ({ ...prev, [key]: false }))}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                              >
                                隐藏
                              </button>
                            </>
                          ) : (
                            <>
                              {config.apiKey ? `${config.apiKey.substring(0, 4)}****${config.apiKey.substring(config.apiKey.length - 4)}` : 'N/A'}
                              <button
                                onClick={() => setShowApiKey(prev => ({ ...prev, [key]: true }))}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                              >
                                显示
                              </button>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {config.rateLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {new Date(config.expireTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {config.status === 1 ? '启用' : '禁用'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(config)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleToggleStatus(config)}
                              className={config.status === 1 ? 'text-yellow-500 hover:text-yellow-700' : 'text-green-500 hover:text-green-700'}
                            >
                              {config.status === 1 ? '禁用' : '启用'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(config)}
                              className="text-red-500 hover:text-red-700"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* 分页组件 */}
        {total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-foreground">
              共 {total} 条记录，当前第 {currentPage} 页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                  }
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                上一页
              </button>
              <button
                onClick={() => {
                  const totalPages = Math.ceil(total / pageSize);
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                  }
                }}
                disabled={Math.ceil(total / pageSize) <= currentPage}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 配置表单 */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex mb-4 space-x-4">
          <button
            onClick={() => switchFormType('basic')}
            className={`px-4 py-2 rounded-md ${formState.type === 'basic' ? 'bg-blue-500 text-white' : 'bg-[var(--bg-soft)] text-foreground'}`}
          >
            基础配置
          </button>
          <button
            onClick={() => switchFormType('tool')}
            className={`px-4 py-2 rounded-md ${formState.type === 'tool' ? 'bg-blue-500 text-white' : 'bg-bg-soft text-foreground'}`}
          >
            工具配置
          </button>
          <button
            onClick={() => switchFormType('protocol')}
            className={`px-4 py-2 rounded-md ${formState.type === 'protocol' ? 'bg-blue-500 text-white' : 'bg-bg-soft text-foreground'}`}
          >
            协议配置
          </button>
          <button
            onClick={() => switchFormType('auth')}
            className={`px-4 py-2 rounded-md ${formState.type === 'auth' ? 'bg-blue-500 text-white' : 'bg-bg-soft text-foreground'}`}
          >
            认证配置
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formState.type === 'basic' && (
            <>
              <div>
                <label htmlFor="gatewayId" className="block text-sm font-medium text-foreground">
                  网关ID *
                </label>
                <input
                  type="text"
                  id="gatewayId"
                  name="gatewayId"
                  value={(formState.formData as any).gatewayId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="gatewayName" className="block text-sm font-medium text-foreground">
                  网关名称 *
                </label>
                <input
                  type="text"
                  id="gatewayName"
                  name="gatewayName"
                  value={(formState.formData as any).gatewayName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="gatewayDesc" className="block text-sm font-medium text-foreground">
                  网关描述
                </label>
                <textarea
                  id="gatewayDesc"
                  name="gatewayDesc"
                  value={(formState.formData as any).gatewayDesc}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-foreground">
                  网关版本
                </label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={(formState.formData as any).version}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="auth" className="block text-sm font-medium text-foreground">
                  认证状态
                </label>
                <select
                  id="auth"
                  name="auth"
                  value={(formState.formData as any).auth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                  网关状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={(formState.formData as any).status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </>
          )}

          {formState.type === 'tool' && (
            <>
              <div>
                <label htmlFor="gatewayId" className="block text-sm font-medium text-foreground">
                  网关ID *
                </label>
                <input
                  type="text"
                  id="gatewayId"
                  name="gatewayId"
                  value={(formState.formData as any).gatewayId || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="toolId" className="block text-sm font-medium text-foreground">
                  工具ID *
                </label>
                <input
                  type="text"
                  id="toolId"
                  name="toolId"
                  value={(formState.formData as any).toolId || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="toolName" className="block text-sm font-medium text-foreground">
                  工具名称 *
                </label>
                <input
                  type="text"
                  id="toolName"
                  name="toolName"
                  value={(formState.formData as any).toolName || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="toolType" className="block text-sm font-medium text-foreground">
                  工具类型 *
                </label>
                <input
                  type="text"
                  id="toolType"
                  name="toolType"
                  value={(formState.formData as any).toolType || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="toolDescription" className="block text-sm font-medium text-foreground">
                  工具描述
                </label>
                <textarea
                  id="toolDescription"
                  name="toolDescription"
                  value={(formState.formData as any).toolDescription || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="toolVersion" className="block text-sm font-medium text-foreground">
                  工具版本
                </label>
                <input
                  type="text"
                  id="toolVersion"
                  name="toolVersion"
                  value={(formState.formData as any).toolVersion || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="protocolId" className="block text-sm font-medium text-foreground">
                  协议ID *
                </label>
                <input
                  type="text"
                  id="protocolId"
                  name="protocolId"
                  value={(formState.formData as any).protocolId || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="protocolType" className="block text-sm font-medium text-foreground">
                  协议类型 *
                </label>
                <input
                  type="text"
                  id="protocolType"
                  name="protocolType"
                  value={(formState.formData as any).protocolType || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                  工具状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={(formState.formData as any).status || 1}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </>
          )}

          {formState.type === 'protocol' && (
            <>
              <div className="border rounded-md p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="protocolId" className="block text-sm font-medium text-foreground">
                      协议ID *
                    </label>
                    <input
                      type="text"
                      id="protocolId"
                      name="protocolId"
                      value={(formState.formData as any).protocolId || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="httpUrl" className="block text-sm font-medium text-foreground">
                      HTTP URL *
                    </label>
                    <input
                      type="text"
                      id="httpUrl"
                      name="httpUrl"
                      value={(formState.formData as any).httpUrl || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="httpMethod" className="block text-sm font-medium text-foreground">
                      HTTP 方法 *
                    </label>
                    <select
                      id="httpMethod"
                      name="httpMethod"
                      value={(formState.formData as any).httpMethod || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeout" className="block text-sm font-medium text-foreground">
                      超时时间 (ms) *
                    </label>
                    <input
                      type="number"
                      id="timeout"
                      name="timeout"
                      value={(formState.formData as any).timeout || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">字段映射</h5>
                    {(formState.formData as any).mappings?.map((mapping: any) => (
                      <div key={mapping.id} className="border rounded-md p-3 mb-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={`mappingType-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              映射类型
                            </label>
                            <select
                              id={`mappingType-${mapping.id}`}
                              value={mapping.mappingType}
                              onChange={(e) => handleMappingChange(mapping.id, 'mappingType', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="request">请求</option>
                              <option value="response">响应</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor={`fieldName-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              字段名称 *
                            </label>
                            <input
                              type="text"
                              id={`fieldName-${mapping.id}`}
                              value={mapping.fieldName}
                              onChange={(e) => handleMappingChange(mapping.id, 'fieldName', e.target.value)}
                              required
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor={`mcpPath-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              MCP 路径 *
                            </label>
                            <input
                              type="text"
                              id={`mcpPath-${mapping.id}`}
                              value={mapping.mcpPath}
                              onChange={(e) => handleMappingChange(mapping.id, 'mcpPath', e.target.value)}
                              required
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor={`mcpType-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              MCP 类型 *
                            </label>
                            <input
                              type="text"
                              id={`mcpType-${mapping.id}`}
                              value={mapping.mcpType}
                              onChange={(e) => handleMappingChange(mapping.id, 'mcpType', e.target.value)}
                              required
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor={`sortOrder-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              排序顺序
                            </label>
                            <input
                              type="number"
                              id={`sortOrder-${mapping.id}`}
                              value={mapping.sortOrder}
                              onChange={(e) => handleMappingChange(mapping.id, 'sortOrder', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor={`isRequired-${mapping.id}`} className="block text-sm font-medium text-foreground">
                              是否必填
                            </label>
                            <select
                              id={`isRequired-${mapping.id}`}
                              value={mapping.isRequired || 0}
                              onChange={(e) => handleMappingChange(mapping.id, 'isRequired', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={0}>否</option>
                              <option value={1}>是</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`description-${mapping.id}`} className="block text-sm font-medium text-foreground">
                            描述
                          </label>
                          <textarea
                            id={`description-${mapping.id}`}
                            value={mapping.description || ''}
                            onChange={(e) => handleMappingChange(mapping.id, 'description', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMapping}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      添加映射
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {formState.type === 'auth' && (
            <>
              <div>
                <label htmlFor="gatewayId" className="block text-sm font-medium text-foreground">
                  网关ID *
                </label>
                <input
                  type="text"
                  id="gatewayId"
                  name="gatewayId"
                  value={(formState.formData as any).gatewayId || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="rateLimit" className="block text-sm font-medium text-foreground">
                  速率限制 (次/分钟) *
                </label>
                <input
                  type="number"
                  id="rateLimit"
                  name="rateLimit"
                  value={(formState.formData as any).rateLimit || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="expireTime" className="block text-sm font-medium text-foreground">
                  过期时间 *
                </label>
                <input
                  type="datetime-local"
                  id="expireTime"
                  name="expireTime"
                  value={(formState.formData as any).expireTime ? (formState.formData as any).expireTime.replace('Z', '').replace('T', ' ') : ''}
                  onChange={(e) => handleInputChange(e)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                  状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={(formState.formData as any).status || 1}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? '保存中...' : '保存配置'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="ml-4 inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md shadow-sm text-foreground bg-[var(--card-background)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              重置
            </button>
          </div>
        </form>
      </div>

      {/* 对话框组件 */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            {dialogType === 'edit' && (
              <>
                <h3 className="text-lg font-semibold mb-4">编辑配置</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  setLoading(true);
                  setError(null);
                  setSuccess(null);
                  
                  try {
                    console.log('开始保存配置，类型:', editFormState.type);
                    console.log('保存配置数据:', editFormState.formData);
                    let response;
                    
                    switch (editFormState.type) {
                      case 'basic':
            // 编辑操作：执行更新
            response = await adminService.updateGateway(editFormState.formData as GatewayConfigRequest, currentConfig.version || '1');
            break;
                      case 'tool':
                        // 编辑操作：执行更新
                        response = await adminService.updateToolConfig(editFormState.formData as GatewayToolConfigRequest, currentConfig.version || '1');
                        break;
                      case 'protocol':
                        // 验证协议配置格式
                        try {
                          JSON.parse(JSON.stringify(editFormState.formData));
                        } catch {
                          throw new Error('协议配置格式不正确');
                        }
                        // 编辑操作：执行更新
                        response = await adminService.updateProtocol(editFormState.formData as GatewayProtocolRequest, currentConfig.version || '1');
                        break;
                      case 'auth':
                        // 编辑操作：执行更新
                        response = await adminService.updateApiKey(editFormState.formData as GatewayAuthRequest, currentConfig.version || '1');
                        break;
                      default:
                        throw new Error('未知的配置类型');
                    }
                    
                    console.log('保存配置响应:', response);
                    // 检查响应结构，使用后端实际的响应格式
                    if (response && (response.code === '0' || response.code === '0000')) {
                      console.log('保存成功');
                      // 重新加载当前配置类型的列表
                      await loadConfigs();
                      setSuccess('保存成功');
                      setDialogOpen(false);
                    } else {
                      console.log('保存失败，消息:', response?.info || '未知错误');
                      setError(response?.info || '保存失败');
                    }
                  } catch (err) {
                    console.error('保存配置错误:', err);
                    setError(err instanceof Error ? err.message : '保存配置失败');
                  } finally {
                    setLoading(false);
                  }
                }} className="space-y-4">
                  {editFormState.type === 'basic' && (
                    <>
                      <div>
                        <label htmlFor="gatewayId" className="block text-sm font-medium text-gray-700">
                          网关ID *
                        </label>
                        <input
                          type="text"
                          id="gatewayId"
                          name="gatewayId"
                          value={(editFormState.formData as any).gatewayId}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="gatewayName" className="block text-sm font-medium text-gray-700">
                          网关名称 *
                        </label>
                        <input
                          type="text"
                          id="gatewayName"
                          name="gatewayName"
                          value={(editFormState.formData as any).gatewayName}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="gatewayDesc" className="block text-sm font-medium text-gray-700">
                          网关描述
                        </label>
                        <textarea
                          id="gatewayDesc"
                          name="gatewayDesc"
                          value={(editFormState.formData as any).gatewayDesc}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                          网关版本
                        </label>
                        <input
                          type="text"
                          id="version"
                          name="version"
                          value={(editFormState.formData as any).version}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="auth" className="block text-sm font-medium text-gray-700">
                          认证状态
                        </label>
                        <select
                          id="auth"
                          name="auth"
                          value={(editFormState.formData as any).auth}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>未认证</option>
                          <option value={1}>已认证</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          网关状态
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={(editFormState.formData as any).status}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>离线</option>
                          <option value={1}>在线</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {editFormState.type === 'tool' && (
                    <>
                      <div>
                        <label htmlFor="gatewayId" className="block text-sm font-medium text-gray-700">
                          网关ID *
                        </label>
                        <input
                          type="text"
                          id="gatewayId"
                          name="gatewayId"
                          value={(editFormState.formData as any).gatewayId || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toolId" className="block text-sm font-medium text-gray-700">
                          工具ID *
                        </label>
                        <input
                          type="text"
                          id="toolId"
                          name="toolId"
                          value={(editFormState.formData as any).toolId || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toolName" className="block text-sm font-medium text-gray-700">
                          工具名称 *
                        </label>
                        <input
                          type="text"
                          id="toolName"
                          name="toolName"
                          value={(editFormState.formData as any).toolName || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toolType" className="block text-sm font-medium text-gray-700">
                          工具类型 *
                        </label>
                        <input
                          type="text"
                          id="toolType"
                          name="toolType"
                          value={(editFormState.formData as any).toolType || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toolDescription" className="block text-sm font-medium text-gray-700">
                          工具描述
                        </label>
                        <textarea
                          id="toolDescription"
                          name="toolDescription"
                          value={(editFormState.formData as any).toolDescription || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toolVersion" className="block text-sm font-medium text-gray-700">
                          工具版本
                        </label>
                        <input
                          type="text"
                          id="toolVersion"
                          name="toolVersion"
                          value={(editFormState.formData as any).toolVersion || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="protocolId" className="block text-sm font-medium text-gray-700">
                          协议ID *
                        </label>
                        <input
                          type="text"
                          id="protocolId"
                          name="protocolId"
                          value={(editFormState.formData as any).protocolId || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="protocolType" className="block text-sm font-medium text-gray-700">
                          协议类型 *
                        </label>
                        <input
                          type="text"
                          id="protocolType"
                          name="protocolType"
                          value={(editFormState.formData as any).protocolType || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          状态
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={(editFormState.formData as any).status || 1}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>启用</option>
                          <option value={0}>禁用</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {editFormState.type === 'protocol' && (
                    <>
                      <div>
                        <label htmlFor="protocolId" className="block text-sm font-medium text-gray-700">
                          协议ID *
                        </label>
                        <input
                          type="text"
                          id="protocolId"
                          name="protocolId"
                          value={(editFormState.formData as any).protocolId || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="protocolType" className="block text-sm font-medium text-gray-700">
                          协议类型 *
                        </label>
                        <input
                          type="text"
                          id="protocolType"
                          name="protocolType"
                          value={(editFormState.formData as any).protocolType || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="httpUrl" className="block text-sm font-medium text-gray-700">
                          HTTP URL *
                        </label>
                        <input
                          type="text"
                          id="httpUrl"
                          name="httpUrl"
                          value={(editFormState.formData as any).httpUrl || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="httpMethod" className="block text-sm font-medium text-gray-700">
                          HTTP 方法 *
                        </label>
                        <select
                          id="httpMethod"
                          name="httpMethod"
                          value={(editFormState.formData as any).httpMethod || 'POST'}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                          超时时间 (ms) *
                        </label>
                        <input
                          type="number"
                          id="timeout"
                          name="timeout"
                          value={(editFormState.formData as any).timeout || 30000}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          状态
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={(editFormState.formData as any).status || 1}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>启用</option>
                          <option value={0}>禁用</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {editFormState.type === 'auth' && (
                    <>
                      <div>
                        <label htmlFor="gatewayId" className="block text-sm font-medium text-gray-700">
                          网关ID *
                        </label>
                        <input
                          type="text"
                          id="gatewayId"
                          name="gatewayId"
                          value={(editFormState.formData as any).gatewayId || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700">
                          速率限制 (次/分钟) *
                        </label>
                        <input
                          type="number"
                          id="rateLimit"
                          name="rateLimit"
                          value={(editFormState.formData as any).rateLimit || ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="expireTime" className="block text-sm font-medium text-gray-700">
                          过期时间 *
                        </label>
                        <input
                          type="datetime-local"
                          id="expireTime"
                          name="expireTime"
                          value={(editFormState.formData as any).expireTime ? (editFormState.formData as any).expireTime.replace('Z', '').replace('T', ' ') : ''}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          状态
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={(editFormState.formData as any).status || 1}
                          onChange={(e) => setEditFormState(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [e.target.name]: e.target.value
                            }
                          }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>启用</option>
                          <option value={0}>禁用</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* 其他类型的表单字段可以根据需要添加 */}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setDialogOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {dialogType === 'delete' && (
              <>
                <h3 className="text-lg font-semibold mb-4">确认删除</h3>
                <p className="mb-6">确定要删除这个配置吗？此操作不可撤销。</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    确认删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
