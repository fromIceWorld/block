import { Component, Input } from '../../decorators/index';

@Component({
    selector: 'router-link',
    template: `<a &href="to">
        <slot></slot>
    </a>`,
    styles: '',
    providers: [],
})
class RouterLink {
    @Input('to') to;
}
export { RouterLink };
