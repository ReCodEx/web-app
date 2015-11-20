<?php

namespace App\Presenters;

use Nette;
use App\Model;
use Kdyby\RabbitMq;
use Nette\Utils\Json;


class HomepagePresenter extends BasePresenter
{
	/** @var RabbitMq\Connection */
	private $rabbit;

	public function injectRabbit (RabbitMq\Connection $rabbit)
	{
		$this->rabbit = $rabbit;
	}

	public function renderDefault()
	{
		$this->template->anyVariable = 'any value';
	}

	protected function createComponentSubmitForm ()
	{
		$form = new Nette\Application\UI\Form();
		$form->addText('env', 'Environment');
		$form->addUpload('source', 'Source code');
		$form->addSubmit('submit', 'Submit');
		$form->onSuccess[] = $this->submitFormSuccess;

		return $form;
	}

	public function submitFormSuccess (Nette\Application\UI\Form $form)
	{
		$values = $form->getValues();
		$producer = $this->rabbit->getProducer('tasks');

		$message = [
			'environment' => $values->env,
			'source' => $values->source->getContents()
		];

		$producer->publish(Json::encode($message), $values->env);

		$this->flashMessage('Submitted');
		$this->redirect('this');
	}
}
