const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Test the Python scripts directly
async function testPythonScripts() {
    console.log('Testing Python scripts...');
    
    // Create a test image
    const testImagePath = path.join(__dirname, 'test_server_input.png');
    const testImage = sharp({
        create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    });
    await testImage.png().toFile(testImagePath);
    
    const testMessage = "Hello from server test!";
    const testPassword = "test_password_123";
    const outputPath = path.join(__dirname, 'test_server_output.png');
    
    try {
        // Test encoding
        console.log('Testing encoding...');
        const encodeOptions = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [testImagePath, outputPath, testMessage, testPassword]
        };
        
        const encodeOutput = await new Promise((resolve, reject) => {
            const pyshell = new PythonShell('steg.py', encodeOptions);
            let output = [];
            let error = null;
            
            pyshell.on('message', (msg) => {
                console.log('Encode output:', msg);
                output.push(msg);
            });
            pyshell.on('stderr', (stderr) => {
                console.error('Encode stderr:', stderr);
                error = new Error(stderr);
            });
            pyshell.on('error', (err) => {
                console.error('Encode error:', err);
                error = err;
            });
            pyshell.end((err) => {
                if (err || error) {
                    reject(err || error);
                } else {
                    resolve(output);
                }
            });
        });
        
        console.log('Encoding successful!');
        
        // Test decoding
        console.log('Testing decoding...');
        const decodeOptions = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [outputPath, testPassword]
        };
        
        const decodeOutput = await new Promise((resolve, reject) => {
            const pyshell = new PythonShell('decode_Steg0.py', decodeOptions);
            let output = [];
            let error = null;
            
            pyshell.on('message', (msg) => {
                console.log('Decode output:', msg);
                output.push(msg);
            });
            pyshell.on('stderr', (stderr) => {
                console.error('Decode stderr:', stderr);
                error = new Error(stderr);
            });
            pyshell.on('error', (err) => {
                console.error('Decode error:', err);
                error = err;
            });
            pyshell.end((err) => {
                if (err || error) {
                    reject(err || error);
                } else {
                    resolve(output);
                }
            });
        });
        
        const decodedMessage = decodeOutput.join('\n');
        if (decodedMessage.includes('Recovered message:')) {
            const actualMessage = decodedMessage.split('Recovered message: ')[1].trim();
            if (actualMessage === testMessage) {
                console.log('✅ Server test passed! Message matches.');
                return true;
            } else {
                console.log('❌ Message mismatch!');
                console.log('Expected:', testMessage);
                console.log('Got:', actualMessage);
                return false;
            }
        } else {
            console.log('❌ Decoding failed:', decodedMessage);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    } finally {
        // Cleanup
        [testImagePath, outputPath].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    }
}

// Run the test
testPythonScripts().then(success => {
    if (success) {
        console.log('All tests passed!');
        process.exit(0);
    } else {
        console.log('Tests failed!');
        process.exit(1);
    }
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 