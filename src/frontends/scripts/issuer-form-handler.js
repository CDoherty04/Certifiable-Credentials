async function handleFormSubmission(e) {
    e.preventDefault();

    const { formData, statusDiv, submitButton } = getElements();

    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.className = 'status loading';
    statusDiv.textContent = 'Issuing credential...';
    submitButton.disabled = true;

    // Call issueCredential
    try {
        const response = await issueCredential(formData);
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
document.addEventListener('DOMContentLoaded', function() {
    initializeImageUpload();
});

function initializeImageUpload() {
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('imageUpload');
    const browseButton = dragDropArea.querySelector('.browse-button');

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
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
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

function displayFileInfo(file) {
    // This function is no longer needed as we're replacing the entire area
}

function createImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Remove existing preview if any
        const existingPreview = document.querySelector('.image-preview-container');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Get the drag-drop area to replace it
        const dragDropArea = document.getElementById('dragDropArea');
        
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
        
        // Replace the drag-drop area with the preview
        dragDropArea.parentNode.replaceChild(previewContainer, dragDropArea);
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
    
    // Remove image preview and restore drag-drop area
    const existingPreview = document.querySelector('.image-preview-container');
    if (existingPreview) {
        // Recreate the drag-drop area
        const fileUploadContainer = document.querySelector('.file-upload-container');
        const newDragDropArea = document.createElement('div');
        newDragDropArea.className = 'drag-drop-area';
        newDragDropArea.id = 'dragDropArea';
        newDragDropArea.innerHTML = `
            <div class="drag-drop-content">
                <div class="drag-drop-icon">📷</div>
                <p class="drag-drop-text">Drag & drop an image here</p>
                <p class="drag-drop-subtext">or</p>
                <input type="file" id="imageUpload" name="imageUpload" accept="image/*" class="file-input">
                <label class="browse-button">Browse Files</label>
            </div>
        `;
        
        // Replace preview with new drag-drop area
        existingPreview.parentNode.replaceChild(newDragDropArea, existingPreview);
        
        // Reinitialize event listeners for the new drag-drop area
        initializeImageUpload();
    }
    
    // Reset file input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.value = '';
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

async function issueCredential(formData) {
    // Make API request
    const response = await fetch('/api/issueCredential', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    return response;
}

function getElements() {
    try {
        const credentialDataValue = document.getElementById('credentialData').value;

        const formData = {
            issuerSeed: document.getElementById('issuerSeed').value,
            subjectAddress: document.getElementById('subjectAddress').value,
            subjectEmail: document.getElementById('subjectEmail').value,
            credentialData: JSON.parse(credentialDataValue),
            imageFile: selectedImage // Include the selected image file
        };

        // Get other elements
        const statusDiv = document.getElementById('status');
        const submitButton = document.querySelector('button[type="submit"]');

        return { formData, statusDiv, submitButton };
    } catch (error) {
        console.error('Error in getElements:', error);
        throw error;
    }
}