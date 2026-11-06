import { fetchDoli } from '../../api/dolibarr.js';

export async function uploadFileToDoli(apiUrl, token, entity, file, modulepart, ref) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Content = reader.result.split(',')[1];
                const documentData = {
                    filecontent: base64Content,
                    filename: file.name,
                    fileencoding: "base64",
                    modulepart: modulepart,
                    ref: ref
                };
                
                const headers = {
                    'DOLAPIKEY': token,
                    'Content-Type': 'application/json'
                };
                if (entity && String(entity).trim() !== '') {
                    headers['DOLAPIENTITY'] = String(entity).trim();
                }

                const docResponse = await fetchDoli(`${apiUrl}/documents/upload`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(documentData)
                });

                if (!docResponse.ok) {
                    const docError = await docResponse.json().catch(() => null);
                    let errorMsg = docError?.error?.message || "";
                    throw new Error(`Upload failed: ${errorMsg}`);
                }
                resolve(docResponse);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = error => reject(error);
    });
}
