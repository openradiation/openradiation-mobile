import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { DeleteAllMeasures, DeleteMeasure, PublishMeasure } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss']
})
export class HistoryPage {
  @Select(MeasuresState.measures)
  measures$: Observable<Measure[]>;

  constructor(private store: Store, private alertController: AlertController) {}

  // TODO implement
  showDetail(measure: Measure) {}

  publish(measure: Measure) {
    this.alertController
      .create({
        header: 'Historique',
        subHeader: 'Êtes-vous sûr(e) de vouloir envoyer cette mesure ?',
        message:
          `En envoyant cette mesure, vous acceptez que l'ensemble des données correspondant à cette measure ` +
          `(dont votre position GPS, votre peseudo, etc) soit publié dans la base OpenRadiation.`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Non'
          },
          {
            text: 'Oui',
            handler: () => this.store.dispatch(new PublishMeasure(measure))
          }
        ]
      })
      .then(alert => alert.present());
  }

  delete(measure: Measure) {
    this.alertController
      .create({
        header: 'Historique',
        message: `Êtes-vous sûr(e) de vouloir supprimer cette mesure ?`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Non'
          },
          {
            text: 'Oui',
            handler: () => this.store.dispatch(new DeleteMeasure(measure))
          }
        ]
      })
      .then(alert => alert.present());
  }

  deleteAll() {
    this.alertController
      .create({
        header: 'Historique',
        subHeader: 'Êtes-vous sûr de vouloir supprimer toutes les mesures ?',
        message: `En supprimant vos mesures, vous nettoyez tout votre historique mais vous ne supprimez pas les données déjà publiées de la base OpenRadiation`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Non'
          },
          {
            text: 'Oui',
            handler: () => this.store.dispatch(new DeleteAllMeasures())
          }
        ]
      })
      .then(alert => alert.present());
  }
}
