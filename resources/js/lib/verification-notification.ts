import {
    queryParams,
    type RouteDefinition,
    type RouteFormDefinition,
    type RouteQueryOptions,
} from '@/wayfinder';

/** Fortify POST `verification.send` quando a feature de email verificacao esta desligada na config. */
const VERIFICATION_NOTIFICATION_PATH = '/email/verification-notification';

export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
});

send.url = (options?: RouteQueryOptions) =>
    VERIFICATION_NOTIFICATION_PATH + queryParams(options ?? {});

send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
});

const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
});

sendForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
});

send.form = sendForm;
