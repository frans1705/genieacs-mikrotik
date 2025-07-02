// web/config/genieacs.js - GenieACS API integration for web interface
const axios = require('axios');
const { logger } = require('../../config/logger');

// Load settings
function getGenieACSConfig() {
    try {
        const settings = require('../../settings.json');
        return {
            url: `http://${settings.genieacs_url}`,
            username: settings.genieacs_username,
            password: settings.genieacs_password
        };
    } catch (error) {
        logger.error(`Error loading GenieACS config: ${error.message}`);
        return null;
    }
}

// Get all devices
async function getAllDevices() {
    try {
        const config = getGenieACSConfig();
        if (!config) {
            throw new Error('GenieACS configuration not available');
        }

        const response = await axios.get(`${config.url}/devices`, {
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });

        return response.data;
    } catch (error) {
        logger.error(`Error getting all devices: ${error.message}`);
        throw error;
    }
}

// Get device by ID
async function getDeviceById(deviceId) {
    try {
        const config = getGenieACSConfig();
        if (!config) {
            throw new Error('GenieACS configuration not available');
        }

        // Menggunakan query parameter sesuai dokumentasi API GenieACS
        const query = JSON.stringify({
            '_id': deviceId
        });

        const response = await axios.get(`${config.url}/devices/`, {
            params: {
                query: query
            },
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });

        if (!response.data || response.data.length === 0) {
            throw new Error(`Device not found: ${deviceId}`);
        }

        return response.data[0];
    } catch (error) {
        logger.error(`Error getting device ${deviceId}: ${error.message}`);
        throw error;
    }
}

// Find device by phone number (tag)
async function findDeviceByPhoneNumber(phoneNumber) {
    try {
        const devices = await getAllDevices();
        if (!devices) return null;

        // Clean phone number
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        // Find device with matching tag
        const device = devices.find(device => {
            const tags = device._tags || [];
            return tags.some(tag => {
                const cleanTag = tag.replace(/[^0-9]/g, '');
                return cleanTag === cleanNumber || cleanTag.endsWith(cleanNumber) || cleanNumber.endsWith(cleanTag);
            });
        });

        return device || null;
    } catch (error) {
        logger.error(`Error finding device by phone number ${phoneNumber}: ${error.message}`);
        return null;
    }
}

// Set parameter values
async function setParameterValues(deviceId, parameters) {
    try {
        const config = getGenieACSConfig();
        if (!config) {
            throw new Error('GenieACS configuration not available');
        }

        const encodedDeviceId = encodeURIComponent(deviceId);
        
        // Convert parameters object to parameterValues array
        const parameterValues = [];

        for (const [path, value] of Object.entries(parameters)) {
            // Handle SSID update
            if (path.includes('SSID')) {
                // Jika SSID berakhiran -5G, update WLANConfiguration.5 (5GHz)
                if (value.endsWith('-5G')) {
                    parameterValues.push(
                        ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.SSID", value, "xsd:string"],
                        ["Device.WiFi.SSID.5.SSID", value, "xsd:string"]
                    );
                } else {
                    // Jika SSID tidak berakhiran -5G, update WLANConfiguration.1 (2.4GHz)
                    parameterValues.push(
                        ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID", value, "xsd:string"],
                        ["Device.WiFi.SSID.1.SSID", value, "xsd:string"]
                    );
                }
            }
            // Handle WiFi password update
            else if (path.includes('Password') || path.includes('KeyPassphrase')) {
                // Update password untuk kedua band (2.4GHz dan 5GHz)
                parameterValues.push(
                    // 2.4GHz band
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.KeyPassphrase", value, "xsd:string"],
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.KeyPassphrase", value, "xsd:string"],
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.PreSharedKey", value, "xsd:string"],
                    // 5GHz band
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.PreSharedKey.1.KeyPassphrase", value, "xsd:string"],
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.KeyPassphrase", value, "xsd:string"],
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.PreSharedKey.1.PreSharedKey", value, "xsd:string"]
                );
            }
            // Handle other parameters
            else {
                parameterValues.push([path, value, "xsd:string"]);
            }
        }

        const response = await axios.post(`${config.url}/devices/${encodedDeviceId}/tasks?connection_request`, {
            name: 'setParameterValues',
            parameterValues
        }, {
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });

        return { success: true, data: response.data };
    } catch (error) {
        logger.error(`Error setting parameters for device ${deviceId}: ${error.message}`);
        throw error;
    }
}

// Restart device
async function restartDevice(deviceId) {
    try {
        const config = getGenieACSConfig();
        if (!config) {
            throw new Error('GenieACS configuration not available');
        }

        const encodedDeviceId = encodeURIComponent(deviceId);
        
        const response = await axios.post(`${config.url}/devices/${encodedDeviceId}/tasks?connection_request`, {
            name: 'reboot'
        }, {
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });

        return { success: true, message: 'Device restart initiated', data: response.data };
    } catch (error) {
        logger.error(`Error restarting device ${deviceId}: ${error.message}`);
        throw error;
    }
}

// Factory reset device
async function factoryResetDevice(deviceId) {
    try {
        const config = getGenieACSConfig();
        if (!config) {
            throw new Error('GenieACS configuration not available');
        }

        const encodedDeviceId = encodeURIComponent(deviceId);
        
        const response = await axios.post(`${config.url}/devices/${encodedDeviceId}/tasks?connection_request`, {
            name: 'factoryReset'
        }, {
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });

        return { success: true, message: 'Device factory reset initiated', data: response.data };
    } catch (error) {
        logger.error(`Error factory resetting device ${deviceId}: ${error.message}`);
        throw error;
    }
}

// Get device parameter value with fallback paths
function getParameterValue(device, paths) {
    if (!device || !paths || !Array.isArray(paths)) return null;
    
    for (const path of paths) {
        try {
            const pathParts = path.split('.');
            let current = device;
            
            for (const part of pathParts) {
                if (current && typeof current === 'object') {
                    current = current[part];
                } else {
                    break;
                }
            }
            
            // Handle GenieACS parameter format
            if (current && typeof current === 'object' && current._value !== undefined) {
                const value = current._value;
                if (typeof value === 'string' && value.trim() !== '') {
                    return value;
                }
            }
            
            // Handle direct value
            if (current !== null && current !== undefined && typeof current === 'string' && current.trim() !== '') {
                return current;
            }
        } catch (error) {
            // Continue to next path
        }
    }
    return null;
}

// Get device status
function getDeviceStatus(device) {
    if (!device) return { isOnline: false, status: 'Unknown' };
    
    const lastInform = new Date(device._lastInform);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastInform) / (1000 * 60));
    const isOnline = diffMinutes < 15;
    
    return {
        isOnline,
        status: isOnline ? 'Online' : 'Offline',
        lastInform: lastInform.toLocaleString(),
        minutesAgo: diffMinutes
    };
}

// Get device basic info
function getDeviceBasicInfo(device) {
    if (!device) return null;
    
    const serialPaths = [
        'VirtualParameters.getSerialNumber',
        'InternetGatewayDevice.DeviceInfo.SerialNumber',
        'Device.DeviceInfo.SerialNumber'
    ];
    
    const modelPaths = [
        'InternetGatewayDevice.DeviceInfo.ModelName',
        'Device.DeviceInfo.ModelName'
    ];
    
    const manufacturerPaths = [
        'InternetGatewayDevice.DeviceInfo.Manufacturer',
        'Device.DeviceInfo.Manufacturer'
    ];
    
    const firmwarePaths = [
        'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
        'Device.DeviceInfo.SoftwareVersion'
    ];
    
    return {
        serialNumber: getParameterValue(device, serialPaths) || 'N/A',
        model: getParameterValue(device, modelPaths) || 'N/A',
        manufacturer: getParameterValue(device, manufacturerPaths) || 'N/A',
        firmware: getParameterValue(device, firmwarePaths) || 'N/A',
        ...getDeviceStatus(device)
    };
}

module.exports = {
    getAllDevices,
    getDeviceById,
    findDeviceByPhoneNumber,
    setParameterValues,
    restartDevice,
    factoryResetDevice,
    getParameterValue,
    getDeviceStatus,
    getDeviceBasicInfo
};
