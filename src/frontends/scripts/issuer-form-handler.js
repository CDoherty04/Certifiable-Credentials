async function handleFormSubmission(e) {
    e.preventDefault();

    const { fullFormData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Processing image and issuing credential...';
    submitButton.disabled = true;

    // Call issueCredential
    try {
        const response = await issueCredential(fullFormData);
        if (response.ok) {
            const result = await response.json();

            if (result.success) {
                // Hide status and show results
                statusDiv.style.display = 'none';
                issuerDisplayResults(result);
            } else {
                // Show error in status
                statusDiv.className = 'status error';
                statusDiv.textContent = `Error: ${result.message || 'Unknown error occurred'}`;
                statusDiv.style.display = 'block';
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        statusDiv.className = 'status error';
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.style.display = 'block';
        console.error('Error:', error);
    } finally {
        submitButton.disabled = false;
    }

    return false; // Prevent form submission
}

// Image handling functionality
let selectedImage = null;

// Initialize image upload functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing issuer form...');
    
    // Check if elements exist immediately
    const immediateCheck = {
        dragDropArea: !!document.getElementById('dragDropArea'),
        imageUpload: !!document.getElementById('imageUpload'),
        credentialForm: !!document.getElementById('credentialForm')
    };
    
    console.log('Immediate element check:', immediateCheck);
    
    // Add a small delay to ensure all elements are fully accessible
    setTimeout(() => {
        console.log('Starting initialization after delay...');
        
        // Check elements again after delay
        const delayedCheck = {
            dragDropArea: !!document.getElementById('dragDropArea'),
            imageUpload: !!document.getElementById('imageUpload'),
            credentialForm: !!document.getElementById('credentialForm')
        };
        
        console.log('Delayed element check:', delayedCheck);
        
        initializeImageUpload();
        initializeFormSubmission();
    }, 100);
});

function initializeFormSubmission() {
    const form = document.getElementById('credentialForm');
    if (form) {
        console.log('Form found, attaching submit handler...');
        form.addEventListener('submit', handleFormSubmission);
    } else {
        console.error('Form not found!');
    }
}

function initializeImageUpload() {
    console.log('initializeImageUpload called...');
    
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!dragDropArea) {
        console.error('dragDropArea not found!');
        return;
    }
    
    if (!fileInput) {
        console.error('fileInput (imageUpload) not found!');
        return;
    }
    
    const browseButton = dragDropArea.querySelector('.browse-button');
    if (!browseButton) {
        console.error('browseButton not found!');
        return;
    }

    console.log('All image upload elements found, initializing...');
    console.log('Elements:', {
        dragDropArea: dragDropArea.id,
        fileInput: fileInput.id,
        browseButton: browseButton.textContent
    });

    // Drag and drop event listeners
    dragDropArea.addEventListener('dragover', handleDragOver);
    dragDropArea.addEventListener('dragleave', handleDragLeave);
    dragDropArea.addEventListener('drop', handleDrop);

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Browse button click event
    browseButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    console.log('Image upload initialization complete');
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dragDropArea = document.getElementById('dragDropArea');
    dragDropArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dragDropArea = document.getElementById('dragDropArea');
    dragDropArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const dragDropArea = document.getElementById('dragDropArea');
    dragDropArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        // Also set the file in the imageUpload element so it can be accessed during form submission
        const imageUploadElement = document.getElementById('imageUpload');
        if (imageUploadElement) {
            // Create a new FileList-like object and set it
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[0]);
            imageUploadElement.files = dataTransfer.files;
            console.log('File set in imageUpload element via drag and drop');
        }
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        console.log('File selected via file input:', file.name);
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB.');
        return;
    }

    // Store the selected image
    selectedImage = file;

    // Create image preview (this will replace the drag-drop area)
    createImagePreview(file);
}

function createImagePreview(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        // Remove existing preview if any
        const existingPreview = document.querySelector('.image-preview-container');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Get the drag-drop area and hide it instead of replacing it
        const dragDropArea = document.getElementById('dragDropArea');
        if (dragDropArea) {
            dragDropArea.style.display = 'none';
        }

        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'image-preview-container';

        // Create preview image
        const previewImg = document.createElement('img');
        previewImg.src = e.target.result;
        previewImg.className = 'image-preview';
        previewImg.alt = 'Image preview';

        // Create remove button overlay
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-image-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.onclick = removeSelectedFile;

        // Create preview info
        const previewInfo = document.createElement('div');
        previewInfo.className = 'image-preview-info';
        previewInfo.innerHTML = `
            <span class="preview-filename">${file.name}</span>
            <span class="preview-filesize">${formatFileSize(file.size)}</span>
        `;

        // Add to container
        previewContainer.appendChild(previewImg);
        previewContainer.appendChild(removeBtn);
        previewContainer.appendChild(previewInfo);

        // Insert the preview after the drag-drop area instead of replacing it
        if (dragDropArea && dragDropArea.parentNode) {
            dragDropArea.parentNode.insertBefore(previewContainer, dragDropArea.nextSibling);
        }
        
        console.log('Image preview created, drag-drop area hidden but preserved');
    };

    reader.readAsDataURL(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeSelectedFile() {
    selectedImage = null;

    // Remove image preview and show drag-drop area again
    const existingPreview = document.querySelector('.image-preview-container');
    if (existingPreview) {
        existingPreview.remove();
        console.log('Image preview removed');
    }

    // Show the drag-drop area again
    const dragDropArea = document.getElementById('dragDropArea');
    if (dragDropArea) {
        dragDropArea.style.display = 'block';
        console.log('Drag-drop area shown again');
    }

    // Reset file input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.value = '';
        console.log('File input reset successfully');
    } else {
        console.error('File input not found - this should not happen now');
    }
}

function issuerDisplayResults(result) {
    const resultsDiv = document.getElementById('results');
    const issuerCredentialDataLink = document.getElementById('issuerCredentialDataLink');
    const issuerNftExplorerLink = document.getElementById('issuerNftExplorerLink');
    const sellOfferId = document.getElementById('sellOfferId');

    // Set up the credential data link
    issuerCredentialDataLink.href = result.uri;
    issuerCredentialDataLink.style.display = 'inline-block';

    // Set up the NFT explorer link
    issuerNftExplorerLink.href = `https://devnet.xrpl.org/nft/${result.nftId}`;
    issuerNftExplorerLink.style.display = 'inline-block';

    // Display the sell offer ID in the textarea
    sellOfferId.value = result.sellOfferId;

    // Show the results section
    resultsDiv.style.display = 'block';
}

function copySellOfferId() {
    const sellOfferId = document.getElementById('sellOfferId');
    const copyButton = document.getElementById('copyButton');

    if (sellOfferId.value) {
        try {
            // Copy the text
            navigator.clipboard.writeText(sellOfferId.value).then(() => {
                // Show success feedback
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅';
                copyButton.className = 'copy-button copied';

                // Reset button after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.className = 'copy-button';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = sellOfferId.value;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Show success feedback
                const originalText = copyButton.textContent;
                copyButton.textContent = '✅';
                copyButton.className = 'copy-button copied';

                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.className = 'copy-button';
                }, 2000);
            });
        } catch (err) {
            // Show error feedback
            copyButton.textContent = '❌';
            copyButton.className = 'copy-button error';

            setTimeout(() => {
                copyButton.textContent = '📋';
                copyButton.className = 'copy-button';
            }, 2000);
        }
    }
}

async function issueCredential(fullFormData) {
    console.log('fullFormData', fullFormData)
    
    try {
        // Call the issueCredential API directly - it will handle image upload internally
        console.log('Calling issueCredential API...');
        const response = await fetch('/api/issueCredential', {
            method: 'POST',
            body: fullFormData
        });

        return response;

    } catch (error) {
        console.error('Error in issueCredential:', error);
        throw error;
    }
}


function getElements() {
    try {
        console.log('getElements called - checking for elements...');
        
        // Check if all required elements exist
        const credentialDataElement = document.getElementById('credentialData');
        const issuerSeedElement = document.getElementById('issuerSeed');
        const subjectAddressElement = document.getElementById('subjectAddress');
        const subjectEmailElement = document.getElementById('subjectEmail');
        const imageUploadElement = document.getElementById('imageUpload');
        const statusDiv = document.getElementById('status');
        const submitButton = document.querySelector('button[type="submit"]');

        console.log('Elements found:', {
            credentialData: !!credentialDataElement,
            issuerSeed: !!issuerSeedElement,
            subjectAddress: !!subjectAddressElement,
            subjectEmail: !!subjectEmailElement,
            imageUpload: !!imageUploadElement,
            statusDiv: !!statusDiv,
            submitButton: !!submitButton
        });

        // Additional debugging for imageUpload element
        if (imageUploadElement) {
            console.log('ImageUpload element details:', {
                id: imageUploadElement.id,
                name: imageUploadElement.name,
                type: imageUploadElement.type,
                files: imageUploadElement.files,
                filesLength: imageUploadElement.files ? imageUploadElement.files.length : 'no files property'
            });
        } else {
            console.error('ImageUpload element not found!');
            console.log('Available elements with similar names:');
            const allInputs = document.querySelectorAll('input');
            allInputs.forEach(input => {
                if (input.type === 'file' || input.id.includes('image') || input.name.includes('image')) {
                    console.log('Found similar input:', {
                        id: input.id,
                        name: input.name,
                        type: input.type
                    });
                }
            });
        }

        // Validate that all elements exist
        if (!credentialDataElement) throw new Error('Credential data element not found');
        if (!issuerSeedElement) throw new Error('Issuer seed element not found');
        if (!subjectAddressElement) throw new Error('Subject address element not found');
        if (!subjectEmailElement) throw new Error('Subject email element not found');
        if (!imageUploadElement) throw new Error('Image upload element not found');
        if (!statusDiv) throw new Error('Status div not found');
        if (!submitButton) throw new Error('Submit button not found');

        const credentialDataValue = credentialDataElement.value;

        const formData = {
            issuerSeed: issuerSeedElement.value,
            subjectAddress: subjectAddressElement.value,
            subjectEmail: subjectEmailElement.value,
            credentialData: JSON.parse(credentialDataValue),
        };

        const image = imageUploadElement.files[0];
        console.log('image', image);
        console.log('imageUploadElement.files:', imageUploadElement.files);
        console.log('imageUploadElement.files.length:', imageUploadElement.files.length);

        if (!image) {
            throw new Error('No image file selected');
        }

        // Get image
        const fullFormData = new FormData();
        fullFormData.append('image', image);
        fullFormData.append('data', JSON.stringify(formData));

        return { fullFormData, statusDiv, submitButton };
    } catch (error) {
        console.error('Error in getElements:', error);
        throw error;
    }
}