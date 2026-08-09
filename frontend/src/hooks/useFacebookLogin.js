import { useCallback } from 'react';

export const FACEBOOK_APP_ID = '3486125941550675';

let fbSdkPromise = null;

const cargarFacebookSdk = () => {
    if (!fbSdkPromise) {
        fbSdkPromise = new Promise((resolve) => {
            if (window.FB) { resolve(window.FB); return; }
            window.fbAsyncInit = () => {
                window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
                resolve(window.FB);
            };
            const js = document.createElement('script');
            js.id = 'facebook-jssdk';
            js.src = 'https://connect.facebook.net/es_LA/sdk.js';
            document.body.appendChild(js);
        });
    }
    return fbSdkPromise;
};

// Devuelve una función que abre el login de Facebook y resuelve con el perfil del usuario
export const useFacebookLogin = () => {
    return useCallback(async () => {
        const FB = await cargarFacebookSdk();
        const response = await new Promise((resolve) => FB.login(resolve, { scope: 'email,public_profile' }));
        if (!response.authResponse) throw new Error('El inicio de sesión con Facebook fue cancelado');

        return new Promise((resolve) => {
            FB.api('/me', { fields: 'id,first_name,last_name,email,picture.type(large)' }, resolve);
        });
    }, []);
};
